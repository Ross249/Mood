import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from "react-native";
import React, { useRef, useEffect, useState, useMemo, Ref } from "react";
import { RootStackScreenProps, RootTabScreenProps } from "../../types/global";
import device from "../../common/device";
import colors from "../../common/colors";
import globalState from "../../common/globalState";
import SvgLinearGradient from "../../components/LinearGradient";
import PlayListItem from "../../components/PlayListItem";
import { ImageColorsResult, getColors } from "react-native-image-colors";
import { LinearGradient } from "expo-linear-gradient";
import { adUnitId, generalProperties } from "../../common/constant";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  PlayListDetailResponseData,
  PlayListInfo,
  Song,
} from "../../types/response";
import { HomeService } from "../../services/Home.serveice";
import {
  useCommoneActions,
  useCurrentPlayListID,
  useLikeAlbums,
  useShuffleList,
  useShuffleMode,
  useToken,
  useUserInfo,
} from "../../store/user";
import TrackPlayer, {
  Track,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { API_URL } from "../../common/API_URL";
import { Ionicons } from "@expo/vector-icons";
import { shuffle } from "lodash";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import * as Network from "expo-network";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { formatTrack } from "../../common/utils";
import PlayerHint from "../../components/PlayerHint";

const Album = ({ navigation, route }: RootTabScreenProps<"Album">) => {
  const setIsError = useCommoneActions().setIsError;
  const setIsLoading = useCommoneActions().setLoading;
  const userInfo = useUserInfo();
  const scrollRef = useRef<ScrollView>();
  const shuffleList = useShuffleList();
  const [songs, setSongs] = useState<Track[]>([]);
  const getCurrentPlayListID = useCurrentPlayListID();
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>();
  const token = useToken();
  const [showHint, setShowHint] = useState(false);
  const playState = usePlaybackState();
  const likeAlbums = useLikeAlbums();
  const setLikeAlbums = useCommoneActions().setLikeAlbumsList;

  // album song with pagination
  const getPlayListDetail = useInfiniteQuery<PlayListDetailResponseData>({
    queryKey: ["play_list", route.params.album_id],
    queryFn: ({
      pageParam = 1,
      pageSize = 8,
    }: {
      pageParam?: number;
      pageSize?: number;
    }) =>
      HomeService.getPlayListDetailWithPaginantion({
        id: route.params.album_id.toString(),
        page: pageParam,
        perPage: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.page + 1 > lastPage.total ? false : lastPage.page + 1;
    },
    enabled: !!token,
  });

  // get album songs withou pagination for adding to playing queue
  const getSongList = useQuery<Song[]>({
    queryKey: ["songs", route.params.album_id],
    queryFn: () =>
      HomeService.getPlayListDetail({ id: route.params.album_id.toString() }),
    enabled: !!token && !!route.params.album_id,
  });

  // album information
  const [info, setInfo] = useState<PlayListInfo>({
    id: route.params.album_id,
    cover: route.params.album_cover,
    name: route.params.album_name,
    is_like: route.params.is_like,
    category_name: route.params.category_name,
  });

  const likePlaylist = useMutation({
    mutationKey: ["like_playlist", route.params.album_id],
    mutationFn: HomeService.LikePlayList,
  });

  const unLikePlayList = useMutation({
    mutationKey: ["unlike_playlist", route.params.album_id],
    mutationFn: HomeService.UnLikePlayList,
  });

  // like button in header
  const likeOrUnlike = async () => {
    if (!likeAlbums.includes(route.params.album_id)) {
      setLikeAlbums([...likeAlbums, route.params.album_id]);

      await likePlaylist.mutateAsync(
        {
          id: info.id.toString(),
        },
        {
          onSuccess: () => {
            setShowHint(true);
          },
          onError: () => {
            // setIsError(true);
            setLikeAlbums([
              ...likeAlbums.filter((a) => a !== route.params.album_id),
            ]);
          },
        }
      );
    } else {
      setLikeAlbums([...likeAlbums.filter((a) => a !== route.params.album_id)]);
      await unLikePlayList.mutateAsync(
        {
          id: info.id.toString(),
        },
        {
          onError: () => {
            // setIsError(true);
            setLikeAlbums([...likeAlbums, route.params.album_id]);
          },
        }
      );
    }
  };

  // play all
  const playAllOrPause = async () => {
    /**
     * if user in playing current album
     */
    if (
      info.id === getCurrentPlayListID &&
      info.id !== 0 &&
      playState.state === "playing"
    ) {
      await TrackPlayer.pause();
    } else {
      setCurrentPlayListID(route.params.album_id);
      setCurrentPlayList(songs);
      await TrackPlayer.reset();
      if (shuffleList.includes(route.params.album_id)) {
        await TrackPlayer.setQueue(shuffle(songs));
      } else {
        await TrackPlayer.setQueue(songs);
      }
      await TrackPlayer.play();
    }
  };

  // get active track
  const getActiveTrack = async () => {
    const res = await TrackPlayer.getActiveTrack();
    setCurrentTrack(res);
  };

  // album songs' click function
  const clickToSkip = async (index: number) => {
    console.log(
      `currentplaylistid: ${getCurrentPlayListID},playlistid: ${info.id}`
    );

    let song = songs[index]; // song in original album
    console.log(`index ): ${index}`);
    // let currentTracks = await TrackPlayer.getActiveTrack();
    // if (!!currentTracks && currentTracks.id === song.id) {
    //   await TrackPlayer.play();
    //   return;
    // }
    let queue = await TrackPlayer.getQueue(); // current queue

    if (getCurrentPlayListID === info.id) {
      console.log(`shuffleMode: ${shuffleList.includes(info.id)}`);
      if (!shuffleList.includes(info.id)) {
        queue.length === 0 && (await TrackPlayer.setQueue(songs));
        await TrackPlayer.skip(index, 0);
        await TrackPlayer.play();
      } else {
        let shuffleSongs = shuffle(songs);
        let indexInQueue =
          queue.length > 0
            ? queue.findIndex((s) => s.id === song.id)
            : shuffleSongs.findIndex((s) => s.id === song.id);
        queue.length === 0 && (await TrackPlayer.setQueue(shuffleSongs));
        console.log(`indexInQueue: ${indexInQueue}`);
        await TrackPlayer.skip(indexInQueue, 0);
        await TrackPlayer.play();
      }
    } else {
      console.log("here");

      setCurrentPlayListID(route.params.album_id);
      setCurrentPlayList(songs);
      await TrackPlayer.reset();
      let newSongs = shuffleList.includes(route.params.album_id)
        ? [song].concat(shuffle(songs).filter((s) => s.id !== song.id))
        : songs;
      let i = newSongs.findIndex((s) => s.id === song.id);
      await TrackPlayer.setQueue(newSongs);
      await TrackPlayer.skip(i, 0);
      await TrackPlayer.play();
    }
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  const [domainColor, setDomainColor] = useState("#000");
  const [endColor, setEndColor] = useState("transparent");

  // animated configuration
  const stickyArray = device.web ? [] : [0];
  const headingRange = device.web ? [140, 200] : [230, 280];
  const shuffleRange = [40, 80];
  const imageRange = [40, 80];

  useEffect(() => {
    // get image color
    getColors(info.cover, { cache: true, key: info.cover }).then(
      (data: ImageColorsResult) => {
        if (!!data) {
          console.log(data);

          // const colors_ios = {
          //   background: "#FFFFFB",
          //   detail: "#000000",
          //   platform: "ios",
          //   primary: "#89696B",
          //   secondary: "#D06B5D",
          // };

          // const colors_ios1 = {
          //   background: "#153546",
          //   detail: "#77FBFD",
          //   platform: "ios",
          //   primary: "#EF84BC",
          //   secondary: "#F6CCE5",
          // };

          // const colors_ios2 = {
          //   background: "#110E31",
          //   detail: "#8C76D7",
          //   platform: "ios",
          //   primary: "#DED0FE",
          //   secondary: "#FEFFB3",
          // };

          // const colors_ios3 = {
          //   background: "#02173D",
          //   detail: "#7A9FFA",
          //   platform: "ios",
          //   primary: "#90EFF8",
          //   secondary: "#3290EB",
          // };

          setDomainColor(
            data.platform === "android" || data.platform === "web"
              ? data.vibrant
              : data.primary
          );
          setEndColor(
            data.platform === "android" || data.platform === "web"
              ? data.muted
              : data.background.startsWith("#F")
              ? data.detail
              : data.background
          );
        }
      }
    );
  }, [info.cover]);

  // monitor changes when jump between albums
  useEffect(() => {
    setInfo({
      id: route.params.album_id,
      cover: route.params.album_cover,
      name: route.params.album_name,
      is_like: route.params.is_like,
      category_name: route.params.category_name,
    });

    getSongList.refetch();
  }, [route.params]);

  // monitor query state
  useEffect(() => {
    if (getPlayListDetail.isSuccess) {
      if (getPlayListDetail.data.pages[0].playlist_info.is_like === 1) {
        !likeAlbums.includes(route.params.album_id) &&
          setLikeAlbums([...likeAlbums, route.params.album_id]);
      } else {
        likeAlbums.includes(route.params.album_id) &&
          setLikeAlbums([
            ...likeAlbums.filter((a) => a !== route.params.album_id),
          ]);
      }
      console.log(likeAlbums);

      setInfo({
        ...info,
        is_like: getPlayListDetail.data.pages[0].playlist_info.is_like,
      });

      setIsLoading(false);
    }
    if (getPlayListDetail.isError) {
      setIsLoading(false);
      setIsError(true);
    }
    if (getPlayListDetail.isInitialLoading) {
      setIsLoading(true);
    }
  }, [
    getPlayListDetail.isInitialLoading,
    getPlayListDetail.isSuccess,
    getPlayListDetail.isError,
    getSongList.isSuccess,
  ]);

  // clear effect
  useEffect(() => {
    if (playState.state === "ended") {
      setCurrentPlayListID(0);
      setCurrentPlayList([]);
    }
    if (playState.state === "playing") {
      getActiveTrack();
    }
  }, [playState]);

  // switch for different albums, get new song lists and format
  useEffect(() => {
    if (getSongList.isSuccess) {
      formatTrack(getSongList.data).then((res) => {
        setSongs(res);
      });
    }
  }, [route.params.album_id, getSongList.isSuccess]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [route.params.album_id]);

  // when scroll near the bottom, get new page
  const _onMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const isCloseToBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >
      nativeEvent.contentSize.height - 30;
    if (isCloseToBottom) {
      if (
        getPlayListDetail.data?.pages[getPlayListDetail.data?.pages.length - 1]
          .is_more !== 0 &&
        getPlayListDetail.hasNextPage
      )
        getPlayListDetail.fetchNextPage().catch();
    }
  };

  const opacityHeading = scrollY.interpolate({
    inputRange: headingRange,
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const opacityShuffle = scrollY.interpolate({
    inputRange: shuffleRange,
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const opacityImage = scrollY.interpolate({
    inputRange: imageRange,
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <GestureHandlerRootView style={{ ...globalState.container, zIndex: 99 }}>
      <PanGestureHandler
        onActivated={() => {
          navigation.navigate(route.params.from_navigation);
        }}
        activeOffsetX={80}
      >
        <View style={{ ...globalState.container, zIndex: 100 }}>
          {/* <BlurView intensity={99} style={styles.blurview} tint="dark" /> */}
          <View
            style={{
              width: "100%",
              alignItems: "center",
              zIndex: 999,
              top: 116,
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
          <LinearGradient
            // Background Linear Gradient
            colors={[domainColor, endColor]}
            style={{ ...styles.blurview, zIndex: 0 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.4 }}
          />

          {
            // header
          }
          <View style={styles.containerHeader}>
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={globalState.activeOpacity}
                hitSlop={{ bottom: 5, left: 5, right: 5, top: 5 }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  navigation.navigate(route.params.from_navigation);
                }}
              >
                <Image
                  source={require("../../../assets/icons/back.png")}
                  style={{ width: 28, height: 28, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              {/* <Animated.View
            style={{ opacity: opacityShuffle, alignItems: "center" }}
          >
            <Image
              source={titleIamge}
              style={{ minHeight: 16, resizeMode: "contain", maxWidth: "50%" }}
            />
            <Text style={styles.headerTitle}>{info.name}</Text>
          </Animated.View> */}
              <Animated.View
                style={{ opacity: opacityShuffle, alignItems: "center" }}
              >
                <View style={{ maxWidth: "50%" }}>
                  <Text style={styles.titleText}>
                    {route.params.category_name.split(" ")[0] === "2"
                      ? "2 hour lofi"
                      : route.params.category_name.split(" ")[0] === "4"
                      ? "4 hour lofi"
                      : "1 hour lofi"}
                  </Text>
                </View>
                <Text style={styles.headerTitle}>{info.name}</Text>
              </Animated.View>
              <TouchableOpacity
                activeOpacity={globalState.activeOpacity}
                hitSlop={{ bottom: 5, left: 5, right: 5, top: 5 }}
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={likeOrUnlike}
              >
                {likeAlbums.includes(route.params.album_id) && (
                  <Image
                    source={require("../../../assets/icons/like_fill.png")}
                    style={{ width: 28, height: 28 }}
                  />
                )}
                {!likeAlbums.includes(route.params.album_id) && (
                  <Image
                    source={require("../../../assets/icons/like_outline.png")}
                    style={{ width: 28, height: 28 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {
            // album image
          }
          <Animated.View
            style={[styles.containerFixed, { opacity: opacityImage }]}
          >
            <View style={styles.containerLinear}>
              <SvgLinearGradient fill={domainColor} />
            </View>
            <View style={styles.containerImage}>
              <Image source={{ uri: info.cover }} style={styles.image} />
            </View>
            <View style={styles.containerTitle}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
                {info.name}
              </Text>
            </View>
            <View style={styles.containerAlbum}>
              <Image
                source={require("../../../assets/icons/timer_w.png")}
                style={{ width: 20, height: 20, resizeMode: "contain" }}
              />
              <Text style={styles.albumInfo}>{info.category_name}</Text>
            </View>
          </Animated.View>

          {
            // songs
          }
          <Animated.ScrollView
            ref={scrollRef as Ref<ScrollView>}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={stickyArray}
            style={styles.containerScroll}
            onMomentumScrollEnd={_onMomentumScrollEnd}
          >
            <View style={styles.containerSticky}>
              {/* <Animated.View
            style={[styles.containerStickyLinear, { opacity: opacityShuffle }]}
          >
            <SvgLinearGradient
              fill={endColor}
              end_color={endColor}
              height={50}
            />
          </Animated.View> */}
              <Animated.View
                style={[
                  styles.headerLinear,
                  { opacity: opacityHeading, marginTop: -89 },
                ]}
              >
                {/* <SvgLinearGradient
            height={89}
            fill={domainColor}
            end_color={domainColor}
          /> */}
                <LinearGradient
                  // Background Linear Gradient
                  colors={[domainColor, endColor]}
                  style={{ height: 140, zIndex: 0 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </Animated.View>
              <View style={styles.containerShuffle}>
                <TouchableOpacity
                  activeOpacity={globalState.activeOpacity}
                  style={{
                    gap: 4,
                    minWidth: "18%",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    position: "absolute",
                    zIndex: 900,
                    right: 24,
                    top: 30,
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                    ...styles.btn,
                  }}
                  onPress={playAllOrPause}
                >
                  {info.id === getCurrentPlayListID &&
                  getCurrentPlayListID > 0 &&
                  ["playing", "loading", "buffering", "ready"].includes(
                    playState.state as string
                  ) ? (
                    <Image
                      source={require("../../../assets/icons/pause_arrow.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <Image
                      source={require("../../../assets/icons/play_arrow.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  )}

                  {info.id === getCurrentPlayListID &&
                  getCurrentPlayListID !== 0 &&
                  ["playing", "loading", "buffering", "ready"].includes(
                    playState.state as string
                  ) ? (
                    <Text style={styles.btnText}>Pause</Text>
                  ) : (
                    <Text style={styles.btnText}>Play All</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.containerSongs}>
              {getPlayListDetail.isSuccess &&
                getPlayListDetail.data?.pages.map(
                  (_page_data, i) =>
                    _page_data.list.length > 0 && (
                      <View style={{ width: "100%", alignItems: "center" }}>
                        {_page_data.list.map((_item: any, i: number) => (
                          <PlayListItem
                            songData={_item}
                            press={() =>
                              clickToSkip(
                                songs.findIndex((s) => s.id === _item.id)
                              )
                            }
                            state={
                              playState.state === "playing" &&
                              !!currentTrack &&
                              currentTrack.id === _item.id
                            }
                            key={`Album${info.id},Song${_item.id}`}
                          />
                        ))}
                        {
                          // ad
                        }
                        {userInfo.is_member === 0 && (
                          <TouchableOpacity style={{ paddingBottom: 12 }}>
                            <BannerAd
                              unitId={adUnitId}
                              size={BannerAdSize.BANNER}
                              requestOptions={{
                                requestNonPersonalizedAdsOnly: true,
                                keywords: ["fashion", "clothing"],
                              }}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    )
                )}

              {getPlayListDetail.isSuccess &&
                getPlayListDetail.data?.pages.length > 1 && (
                  <View
                    style={{
                      height:
                        generalProperties.tabPlayerHeight * 2 +
                        generalProperties.tabHeight -
                        22,
                    }}
                  />
                )}
            </View>
          </Animated.ScrollView>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default Album;

const styles = StyleSheet.create({
  blurview: {
    ...(StyleSheet.absoluteFill as {}),
    zIndex: 101,
  },
  containerHeader: {
    height: 89,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 102,
  },
  headerLinear: {
    height: 89,
    width: "100%",
    zIndex: 103,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 72,
    position: "absolute",
    top: 0,
    zIndex: 104,
    width: "100%",
  },
  headerTitle: {
    ...globalState.textSpotifyBold16,
    fontSize: 14,
    fontFamily: "bold",
    color: colors.white,
    paddingHorizontal: 8,
    textAlign: "center",
    width: device.width - 100,
  },
  containerFixed: {
    alignItems: "center",
    paddingTop: device.iPhoneNotch ? 94 : 60,
    position: "absolute",
    width: "100%",
  },
  containerLinear: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: device.web ? 5 : 0,
  },
  containerImage: {
    shadowColor: colors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    zIndex: device.web ? 20 : 0,
  },
  image: {
    height: 180,
    marginBottom: 16,
    width: 180,
  },
  containerTitle: {
    marginTop: device.web ? 8 : 0,
    zIndex: device.web ? 20 : 0,
  },
  title: {
    ...globalState.textSpotifyBold20,
    color: colors.white,
    marginBottom: 8,
    paddingHorizontal: 24,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 27,
    fontFamily: "regular",
    fontWeight: "600",
  },
  containerAlbum: {
    zIndex: device.web ? 20 : 0,
    flexDirection: "row",
  },
  albumInfo: {
    ...globalState.textSpotify12,
    color: "white",
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 8,
    marginBottom: 48,
    fontFamily: "regular",
  },
  containerScroll: {
    paddingTop: 89,
    zIndex: 101,
  },
  containerSticky: {
    marginTop: device.iPhoneNotch ? 238 : 194,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    zIndex: 103,
  },
  containerShuffle: {
    alignItems: "center",
    height: 50,
    // shadowColor: colors.blackBg,
    // shadowOffset: { height: -10, width: 0 },
    // shadowOpacity: 0.2,
    // shadowRadius: 20,
    zIndex: 106,
  },
  containerStickyLinear: {
    position: "absolute",
    top: 89,
    width: "100%",
  },
  btn: {
    backgroundColor: generalProperties.primary,
    borderRadius: 25,
    height: 38,
  },
  btnText: {
    ...globalState.textSpotifyBold16,
    color: colors.white,
    fontSize: 14,
    lineHeight: 14,
    // textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  containerSongs: {
    alignItems: "center",
    // backgroundColor: colors.blackBg,
    minHeight: device.height - 89,
    // minHeight: device.height,
    marginBottom: -40,
    // marginBottom: generalProperties.tabHeight + 24,
    paddingTop: 16,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    width: "100%",
  },
  downloadText: {
    ...globalState.textSpotifyBold18,
    color: colors.white,
  },
  titleText: {
    fontFamily: "dotty",
    fontSize: 24,
    lineHeight: 20,
    color: "white",
  },
});
