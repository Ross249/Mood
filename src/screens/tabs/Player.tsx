import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { adUnitId, generalProperties } from "../../common/constant";
import {
  useCommoneActions,
  useCurrentPlayList,
  useCurrentPlayListID,
  useLikeSongs,
  useRepeatMode,
  useShuffleList,
  useShuffleMode,
  useTimer,
  useToken,
  useUserInfo,
} from "../../store/user";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { format } from "../../common/utils";
import PlayerHint from "../../components/PlayerHint";
import SongPicker from "../../components/SongPicker";
import TrackPlayer, {
  RepeatMode,
  Track,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HomeService } from "../../services/Home.serveice";
import { Song, SongDetailResponseData } from "../../types/response";
import { debounce, includes, shuffle } from "lodash";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  Swipeable,
} from "react-native-gesture-handler";
import PlayerProgressBar from "../../components/PlayerProgressBar";
import PlayerFunction from "../../components/PlayerFunction";

/**
 * music player
 * @returns
 */
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const Player = ({ navigation, route }: RootStackScreenProps<"Player">) => {
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(
    route.params.currentTrack
  );
  const activeTrack = useActiveTrack();
  const { position, duration } = useProgress();
  const [queueLength, setQueueLength] = useState(0);
  const token = useToken();
  const [searchKey, setSearchKey] = useState<string>(
    !!route.params.id ? route.params.id : ""
  );
  const currentplaylistID = useCurrentPlayListID();
  const currentplaylist = useCurrentPlayList();
  const userInfo = useUserInfo();
  const likeSongs = useLikeSongs();
  const setLikeSongs = useCommoneActions().setLikeSongsList;

  const [showList, setShowList] = useState(false);
  const playState = usePlaybackState();
  // timer's rest time
  const timer = useTimer();
  const setIsError = useCommoneActions().setIsError;

  // player repeat mode
  const repeatMode = useRepeatMode();
  // player shuffle mode
  const shuffleList = useShuffleList();
  const setShuffleModeList = useCommoneActions().setShuffleList;

  // top hint
  const [showHint, setShowHint] = useState(false);

  // song detail
  const getSongsDetail = useQuery<SongDetailResponseData>({
    queryKey: ["song_detail", searchKey],
    queryFn: () => HomeService.getSongDetail({ id: searchKey }),
    enabled: !!searchKey,
  });

  // like or unlike music
  const likeMusic = useMutation({
    mutationKey: ["like_music", searchKey],
    mutationFn: HomeService.LikeSong,
  });

  const unLikeMusic = useMutation({
    mutationKey: ["unlike_music", searchKey],
    mutationFn: HomeService.UnLikeSong,
  });

  const likeTrigger = async () => {
    if (likeSongs.includes(searchKey)) {
      setLikeSongs([...likeSongs.filter((item) => item !== searchKey)]);
      await unLikeMusic.mutateAsync(
        { id: searchKey },
        {
          onSuccess: () => {
            getSongsDetail.refetch();
          },
          onError: () => {
            // setIsError(true);
            setLikeSongs([...likeSongs, searchKey]);
          },
        }
      );
    } else {
      setLikeSongs([...likeSongs, searchKey]);
      await likeMusic.mutateAsync(
        { id: searchKey },
        {
          onSuccess: () => {
            getSongsDetail.refetch();
            setShowHint(true);
          },
          onError: () => {
            // setIsError(true);
            setLikeSongs([...likeSongs.filter((item) => item !== searchKey)]);
          },
        }
      );
    }
  };

  // get current track
  const getCurrent = async () => {
    const queue = await TrackPlayer.getQueue();
    const res = await TrackPlayer.getActiveTrack();

    setCurrentTrack(res);
    setSearchKey(res?.id);
    setQueueLength(queue.length);
  };

  const shuffleButtonTrigger = async () => {
    const activeTrack = await TrackPlayer.getActiveTrack();
    console.log(`shuffle mode is ${shuffleList.includes(currentplaylistID)}`);
    const activeIndex = await TrackPlayer.getActiveTrackIndex();
    console.log(`active index is ${activeIndex}`);
    const queue = await TrackPlayer.getQueue();
    console.log(`queues length is ${queue.length}`);
    if (!!activeTrack) {
      const index = currentplaylist.findIndex(
        (item) => item.id === activeTrack.id
      );
      const subTracksBehind = currentplaylist.slice(index + 1);
      const subTracksFront = currentplaylist.slice(0, index);

      console.log(`subTracksBehind length is ${subTracksBehind.length}`);
      console.log(`subTracksFront length is ${subTracksFront.length}`);
      if (shuffleList.includes(currentplaylistID)) {
        setShuffleModeList(
          shuffleList.filter((item) => item !== currentplaylistID)
        );
        await TrackPlayer.move(!!activeIndex ? activeIndex : 0, 0);
        await TrackPlayer.removeUpcomingTracks();
        await TrackPlayer.add(subTracksBehind);
        await TrackPlayer.add(subTracksFront, 0);
      } else {
        setShuffleModeList([...shuffleList, currentplaylistID]);
        await TrackPlayer.removeUpcomingTracks();

        await TrackPlayer.add(shuffle(subTracksBehind));
      }
    }
    return;
  };

  // set repeat mode
  useEffect(() => {
    const setRMode = async () => {
      await TrackPlayer.setRepeatMode(repeatMode);
    };

    setRMode();
  }, [repeatMode]);

  useEffect(() => {
    if (getSongsDetail.isSuccess) {
      if (getSongsDetail.data.is_like === 1) {
        !likeSongs.includes(getSongsDetail.data.id) &&
          setLikeSongs([...likeSongs, getSongsDetail.data.id]);
      } else {
        likeSongs.includes(getSongsDetail.data.id) &&
          setLikeSongs(
            likeSongs.filter((item) => item !== getSongsDetail.data.id)
          );
      }
    }

    if (getSongsDetail.isError) {
      setIsError(true);
    }
  }, [activeTrack?.id, getSongsDetail.isSuccess, getSongsDetail.isError]);

  useEffect(() => {
    getCurrent();
  }, [playState.state]);

  useEffect(() => {
    if (playState.state === "ended") {
      navigation.goBack();
    }
  }, [playState.state]);

  return (
    <GestureHandlerRootView style={globalState.container}>
      <SafeAreaView style={globalState.container}>
        {
          //background
        }
        <View style={styles.background}>
          {!!activeTrack && (
            <Image
              source={{
                uri: activeTrack.artwork,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              blurRadius={Platform.OS === "android" ? 20 : 15}
            />
          )}
        </View>
        <PanGestureHandler
          onActivated={() => navigation.goBack()}
          activeOffsetY={50}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)"]}
            style={{ ...styles.background, zIndex: 2 }}
          >
            {
              // header
            }
            <View style={styles.header}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: Platform.OS === "android" ? 0 : 0,
                }}
                disabled={Platform.OS === "android"}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require("../../../assets/icons/airplay.png")}
                  style={{ width: 28, height: 28, resizeMode: "cover" }}
                />
              </TouchableOpacity>

              <Text style={styles.header_text} numberOfLines={1}>
                {!!activeTrack ? activeTrack.genre : "Song"}
              </Text>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                }}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require("../../../assets/icons/down.png")}
                  style={{
                    width: 28,
                    height: 28,
                    resizeMode: "cover",
                    backgroundColor: "rgba(107, 107, 107, 0.4)",
                    borderRadius: 500,
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  top: userInfo.is_member === 0 ? 0 : 12,
                }}
              >
                {
                  // hint
                }
                {showHint && (
                  <PlayerHint
                    visible={showHint}
                    setVisible={setShowHint}
                    time={3000}
                    text={"Added to your playlist"}
                  />
                )}
              </View>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 82,
                }}
              >
                {
                  // ad
                }
                {userInfo.is_member === 0 && (
                  <View style={{ marginTop: 12 }}>
                    <BannerAd
                      unitId={adUnitId}
                      size={BannerAdSize.BANNER}
                      requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                        keywords: ["fashion", "clothing"],
                      }}
                    />
                  </View>
                )}

                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: generalProperties.paddingX,
                    marginTop: userInfo.is_member === 0 ? 0 : 62,
                  }}
                >
                  {!!activeTrack ? (
                    <Image
                      source={{
                        uri: activeTrack.artwork,
                      }}
                      style={styles.cover}
                    />
                  ) : (
                    <Image
                      source={require("../../../assets/banner/disc.png")}
                      style={styles.cover}
                    />
                  )}
                  <View style={styles.metadata}>
                    <View>
                      <Text style={styles.song} numberOfLines={1}>
                        {!!activeTrack ? activeTrack?.title : "Song name"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={likeTrigger}>
                      {likeSongs.includes(activeTrack?.id) && (
                        <Image
                          source={require("../../../assets/icons/like_fill.png")}
                          style={{
                            width: 24,
                            height: 24,
                            resizeMode: "contain",
                          }}
                        />
                      )}
                      {!likeSongs.includes(activeTrack?.id) && (
                        <Image
                          source={require("../../../assets/icons/like_outline.png")}
                          style={{
                            width: 24,
                            height: 24,
                            resizeMode: "contain",
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <PlayerProgressBar position={position} duration={duration} />

                <PlayerFunction
                  shuffle={shuffleButtonTrigger}
                  shuffled={shuffleList.includes(currentplaylistID)}
                />
              </View>
              {
                // bottom
              }
              <View
                style={{
                  width: "100%",
                  paddingHorizontal: generalProperties.paddingX,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  position: "absolute",
                  bottom: 0,
                }}
              >
                <View style={{}}>
                  {typeof currentplaylistID === "number" &&
                    currentplaylistID > 0 &&
                    queueLength > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          !!token && setShowList(true);
                        }}
                      >
                        <Image
                          source={require("../../../assets/icons/menu.png")}
                          style={{
                            width: 28,
                            height: 28,
                          }}
                        />
                      </TouchableOpacity>
                    )}
                </View>
                <View
                  style={{
                    ...styles.timer_container,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 50,
                    backgroundColor:
                      timer.current > 0
                        ? generalProperties.secondary
                        : "transparent",
                  }}
                >
                  {(parseInt(format(timer.current).split(":")[0]) > 0 ||
                    parseInt(format(timer.current).split(":")[1]) > 0) && (
                    <Text style={styles.timer_text}>
                      {format(timer.current)}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Timer")}
                  >
                    <Image
                      source={require("../../../assets/icons/timer.png")}
                      style={{ width: 28, height: 28, resizeMode: "contain" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </PanGestureHandler>
        <SongPicker visible={showList} setVisible={setShowList} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default React.memo(Player);

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
    zIndex: 1,
  },
  root: {
    flex: 1,
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    marginBottom: 48,
  },
  header: {
    // marginTop: 72,
    marginTop: 0.088 * height,
    paddingHorizontal: generalProperties.paddingX,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header_text: {
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "bold",
    fontSize: 16,
    overflow: "hidden",
  },
  button: {
    padding: 16,
  },
  title: {
    color: "white",
    padding: 16,
  },
  cover: {
    borderRadius: 2,
    width: "100%",
    height: width - generalProperties.paddingX * 2,
    resizeMode: "stretch",
    backgroundColor: generalProperties.secondary,
  },
  metadata: {
    marginVertical: 24,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  song: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    fontFamily: "regular",
    overflow: "hidden",
  },
  artist: {
    color: "white",
  },
  slider: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: width - 32,
    borderRadius: 2,
    height: 4,
    marginVertical: 16,
  },
  controls: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: generalProperties.paddingX,
  },
  timer_container: {
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  timer_text: {
    fontFamily: "regular",
    fontWeight: "bold",
    fontSize: 14,
    color: "#fff",
  },
});
