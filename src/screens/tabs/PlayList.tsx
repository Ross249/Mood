import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { RootTabScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { adUnitId, generalProperties } from "../../common/constant";
import HorizonList from "../../components/HorizonList";
import AlbumCard from "../../components/AlbumCard";
import ExploreListItem from "../../components/ExploreListItem";
import { songsList } from "../../example/songs";
import {
  useCommoneActions,
  useCurrentPlayListID,
  useLoading,
  useShuffleList,
  useToken,
  useUserInfo,
} from "../../store/user";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginationRequest } from "../../types/request";
import { UserService } from "../../services/User.service";
import { MyPlayListResponseData, Song } from "../../types/response";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { flatMap, shuffle, uniq } from "lodash";

import TrackPlayer, { Track } from "react-native-track-player";
import * as Network from "expo-network";
import { API_URL } from "../../common/API_URL";
import { formatTrack, getNetwordState } from "../../common/utils";
/**
 * my play list page
 * @param param0
 * @returns
 */
const PlayList = ({ navigation }: RootTabScreenProps<"MyPlayList">) => {
  const [selected, setSelected] = useState(0); //0 for liked, 1 for recommended
  const isFocus = useIsFocused();
  const isLoading = useLoading();
  // song shuffle state
  const [songs, setSongs] = useState<Track[]>([]);
  const [songsRec, setSongsRec] = useState<Track[]>([]);
  const getCurrentPlayListID = useCurrentPlayListID();
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const shuffleList = useShuffleList();

  const userInfo = useUserInfo();
  const setIsLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const token = useToken();

  const clickToSkip = async (index: number, select: number) => {
    console.log(`currentplaylistid: ${getCurrentPlayListID}`);
    if (!!token) {
      let song = selected === 0 ? songs[index] : songsRec[index]; // song in original album
      console.log(`index ): ${index}`);
      // let currentTracks = await TrackPlayer.getActiveTrack();
      // if (!!currentTracks && currentTracks.id === song.id) {
      //   await TrackPlayer.play();
      //   return;
      // }
      let queue = await TrackPlayer.getQueue(); // current queue

      if (
        getCurrentPlayListID ===
        (selected === 0 ? `PlayListLike` : `PlayListRecommend`)
      ) {
        console.log(
          `shuffleMode: ${shuffleList.includes(
            selected === 0 ? `PlayListLike` : `PlayListRecommend`
          )}`
        );
        if (
          !shuffleList.includes(
            selected === 0 ? `PlayListLike` : `PlayListRecommend`
          )
        ) {
          (queue.length === 0 ||
            queue.length !==
              (selected === 0 ? songsList.length : songsRec.length)) &&
            (await TrackPlayer.setQueue(selected === 0 ? songs : songsRec));
          await TrackPlayer.skip(index, 0);
          await TrackPlayer.play();
        } else {
          let shuffleSongs = shuffle(selected === 0 ? songs : songsRec);
          let indexInQueue =
            queue.length ===
            (selected === 0 ? songsList.length : songsRec.length)
              ? queue.findIndex((s) => s.id === song.id)
              : shuffleSongs.findIndex((s) => s.id === song.id);
          queue.length !==
            (selected === 0 ? songsList.length : songsRec.length) &&
            (await TrackPlayer.setQueue(shuffleSongs));
          console.log(`indexInQueue: ${indexInQueue}`);
          await TrackPlayer.skip(indexInQueue, 0);
          await TrackPlayer.play();
        }
      } else {
        console.log("here");

        setCurrentPlayListID(
          selected === 0 ? `PlayListLike` : `PlayListRecommend`
        );
        setCurrentPlayList(selected === 0 ? songs : songsRec);
        await TrackPlayer.reset();
        let newSongs = shuffleList.includes(
          selected === 0 ? `PlayListLike` : `PlayListRecommend`
        )
          ? [song].concat(
              shuffle(selected === 0 ? songs : songsRec).filter(
                (s) => s.id !== song.id
              )
            )
          : selected === 0
          ? songs
          : songsRec;
        let i = newSongs.findIndex((s) => s.id === song.id);
        await TrackPlayer.setQueue(newSongs);
        await TrackPlayer.skip(i, 0);
        await TrackPlayer.play();
      }
    } else {
      navigation.push("Auth.signin");
    }
  };

  const getLikedMusics = useInfiniteQuery<MyPlayListResponseData>({
    queryKey: ["liked_musics"],
    queryFn: ({
      pageParam = 1,
      pageSize = 8,
    }: {
      pageParam?: number;
      pageSize?: number;
    }) =>
      UserService.getLikePageWithPagination({
        page: pageParam,
        perPage: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      if (!token) {
        return false;
      } else {
        return lastPage.page + 1 > lastPage.total ? false : lastPage.page + 1;
      }
    },
  });

  const getRecommendedMusics = useInfiniteQuery<MyPlayListResponseData>({
    queryKey: ["recommended_musics"],
    queryFn: ({
      pageParam = 1,
      pageSize = 8,
    }: {
      pageParam?: number;
      pageSize?: number;
    }) =>
      UserService.getRecommendPageWithPagination({
        page: pageParam,
        perPage: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      if (!token) {
        return false;
      } else {
        return lastPage.page + 1 > lastPage.total ? false : lastPage.page + 1;
      }
    },
  });

  const formatLikeSongs = useMemo(() => {
    let newLists: Song[] = [];
    flatMap(getLikedMusics.data?.pages, (page) => {
      newLists = newLists.concat(page.list as Song[]);
    });

    return newLists;
  }, [getLikedMusics.data?.pages]);

  const formatRecommendSongs = useMemo(() => {
    let newLists: Song[] = [];
    flatMap(getRecommendedMusics.data?.pages, (page) => {
      newLists = newLists.concat(page.list as Song[]);
    });

    return newLists;
  }, [getRecommendedMusics.data?.pages]);

  useEffect(() => {
    formatTrack(formatLikeSongs).then((songs) => {
      setSongs(songs);
    });
    formatTrack(formatRecommendSongs).then((songs) => {
      setSongsRec(songs);
    });
  }, [formatLikeSongs, formatRecommendSongs]);

  useEffect(() => {
    if (!token && isFocus) {
      navigation.navigate("Auth.signin");
    }
  }, [token, isFocus]);

  useEffect(() => {
    getNetwordState().then((res) => {
      if (res.type === "NONE") {
        setIsError(true);
      }
    });
    if (selected === 0) {
      if (getLikedMusics.isSuccess) {
        setIsLoading(false);
      }
      if (getLikedMusics.isInitialLoading) {
        setIsLoading(true);
      }
      if (getLikedMusics.isError) {
        setIsLoading(false);
        setIsError(true);
      }
    } else {
      if (getRecommendedMusics.isSuccess) {
        setIsLoading(false);
      }
      if (getRecommendedMusics.isInitialLoading) {
        setIsLoading(true);
      }
      if (getRecommendedMusics.isError) {
        setIsLoading(false);
        setIsError(true);
      }
    }
  }, [
    getLikedMusics.isInitialLoading,
    selected,
    getLikedMusics.isError,
    getLikedMusics.isSuccess,
    getRecommendedMusics.isInitialLoading,
    getRecommendedMusics.isError,
    getRecommendedMusics.isSuccess,
  ]);

  const _onMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const isCloseToBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >
      nativeEvent.contentSize.height - 30;
    if (isCloseToBottom) {
      if (selected === 0) {
        if (
          getLikedMusics.data?.pages[getLikedMusics.data?.pages.length - 1]
            .is_more !== 0 &&
          getLikedMusics.hasNextPage
        )
          getLikedMusics.fetchNextPage().catch();
      } else {
        if (
          getRecommendedMusics.data?.pages[
            getRecommendedMusics.data?.pages.length - 1
          ].is_more !== 0 &&
          getRecommendedMusics.hasNextPage
        )
          getRecommendedMusics.fetchNextPage().catch();
      }
    }
  };

  const refresh = () => {
    // getRecommendedMusics.refetch();
    getLikedMusics.refetch();
  };

  useFocusEffect(
    useCallback(() => {
      isFocus && refresh();
    }, [isFocus])
  );

  return (
    <View style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/my_playlist.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.header_font}>My Playlist</Text>
      </View>
      <View style={styles.select_container}>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            maxHeight: 33,
            borderWidth: 1,
            borderColor: selected === 0 ? generalProperties.primary : "#fff",
            backgroundColor:
              selected === 0 ? generalProperties.primary : "rgba(0,0,0,0)",
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
          onPress={() => setSelected(0)}
        >
          <Text style={styles.select_font}>Liked Musics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            marginLeft: 12,
            borderRadius: 100,
            maxHeight: 33,
            borderWidth: 1,
            borderColor: selected === 1 ? generalProperties.primary : "#fff",
            backgroundColor:
              selected === 1 ? generalProperties.primary : "rgba(0,0,0,0)",
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
          onPress={() => setSelected(1)}
        >
          <Text style={styles.select_font}>Recommended</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 24 }}
        onMomentumScrollEnd={_onMomentumScrollEnd}
        refreshControl={
          <RefreshControl
            refreshing={
              selected === 0
                ? getLikedMusics.isFetching
                : getRecommendedMusics.isFetching
            }
            onRefresh={refresh}
          />
        }
      >
        {
          // horizon
        }
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {selected === 0 &&
            getLikedMusics.data?.pages.map((_page_data, i) =>
              _page_data.playlists.map((_item, i) => (
                <AlbumCard
                  key={"ablum_like" + _item.id}
                  value={_item}
                  gapStyle={{ marginLeft: i === 0 ? 24 : 12 }}
                  navigation={navigation}
                  type={
                    _item.category_name.split(" ")[0] === "1"
                      ? "hour1"
                      : _item.category_name.split(" ")[0] === "2"
                      ? "hour2"
                      : "hour4"
                  }
                  from_navigation="MyPlayList"
                />
              ))
            )}
          {selected === 1 &&
            getRecommendedMusics.data?.pages.map((_page_data, i) =>
              _page_data.playlists.map((_item, i) => (
                <AlbumCard
                  key={"ablum_recommend" + _item.id}
                  value={_item}
                  gapStyle={{ marginLeft: i === 0 ? 24 : 12 }}
                  navigation={navigation}
                  type={
                    _item.category_name.split(" ")[0] === "1"
                      ? "hour1"
                      : _item.category_name.split(" ")[0] === "2"
                      ? "hour2"
                      : "hour4"
                  }
                  from_navigation="MyPlayList"
                />
              ))
            )}
        </ScrollView>

        {
          // ad
        }
        {userInfo.is_member === 0 && (
          <View style={{ width: "100%", alignItems: "center", marginTop: 16 }}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.LARGE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
                keywords: ["fashion", "clothing"],
              }}
            />
          </View>
        )}
        {
          // vertical
        }
        <View
          style={{
            marginTop: 24,
            paddingHorizontal: generalProperties.paddingX,
          }}
        >
          {selected === 0 &&
            getLikedMusics.data?.pages.map(
              (_page_data, i) =>
                _page_data.list.length > 0 && (
                  <View>
                    {_page_data.list.map((_item, i) => (
                      <ExploreListItem
                        value={_item}
                        key={"like" + _item.id + i.toString()}
                        press={() =>
                          clickToSkip(
                            songs.findIndex((s) => s.id === _item.id),
                            selected
                          )
                        }
                        type={`PlayListLike`}
                      />
                    ))}
                    {userInfo.is_member === 0 && (
                      <View style={{ width: "100%", alignItems: "center" }}>
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
                  </View>
                )
            )}
          {selected === 1 &&
            getRecommendedMusics.data?.pages.map(
              (_page_data, i) =>
                _page_data.list.length > 0 && (
                  <View>
                    {_page_data.list.map((_item, i) => (
                      <ExploreListItem
                        value={_item}
                        key={"recommend" + _item.id + i.toString()}
                        press={() =>
                          clickToSkip(
                            songsRec.findIndex((s) => s.id === _item.id),
                            selected
                          )
                        }
                        type={`PlayListRecommend`}
                      />
                    ))}
                    {userInfo.is_member === 0 && (
                      <View style={{ width: "100%", alignItems: "center" }}>
                        <Pressable>
                          <BannerAd
                            unitId={adUnitId}
                            size={BannerAdSize.BANNER}
                            requestOptions={{
                              requestNonPersonalizedAdsOnly: true,
                              keywords: ["fashion", "clothing"],
                            }}
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                )
            )}
          <View
            style={{
              width: "100%",
              marginBottom: generalProperties.tabPlayerHeight + 24,
              // +generalProperties.tabHeight,
            }}
          ></View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlayList;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  header: {
    marginTop: generalProperties.marginTop,
    paddingHorizontal: generalProperties.paddingX,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header_font: {
    fontFamily: "semibold",
    fontSize: 24,
    color: "#ffffff",
  },
  select_container: {
    paddingHorizontal: generalProperties.paddingX,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  select_font: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 20,
    fontFamily: "regular",
    fontWeight: "500",
  },
});
