import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RootTabScreenProps } from "../../types/global";
import {
  useCategorys,
  useCommoneActions,
  useCurrentPlayListID,
  useLoading,
  useShuffleList,
  useToken,
  useUserInfo,
} from "../../store/user";
import globalState from "../../common/globalState";
import { adUnitId, generalProperties, songType } from "../../common/constant";
import ExploreListItem from "../../components/ExploreListItem";
import AlbumCard from "../../components/AlbumCard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { HomeService } from "../../services/Home.serveice";
import {
  Category,
  MyPlayListResponseData,
  PlayList,
  PlayListResponseData,
  Song,
} from "../../types/response";
import {
  BannerAd,
  BannerAdSize,
} from "react-native-google-mobile-ads";
import TrackPlayer, { Track } from "react-native-track-player";
import { flatMap, shuffle } from "lodash";
import * as Network from "expo-network";
import { API_URL } from "../../common/API_URL";
import { formatTrack, getNetwordState } from "../../common/utils";

const width = Dimensions.get("screen").width;
/**
 * explore page
 * @param param0
 * @returns
 */
const Explore = ({ navigation, route }: RootTabScreenProps<"Explore">) => {
  const [selected, setSelected] = useState(
    !!route.params?.id ? route.params.id : 1
  );
  const token = useToken();
  // song shuffle state
  const [songs, setSongs] = useState<Track[]>([]);
  const getCurrentPlayListID = useCurrentPlayListID();
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const shuffleList = useShuffleList();

  const isLoading = useLoading();
  const userInfo = useUserInfo();
  const setIsLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const categorys = useCategorys();
  const setCategorys = useCommoneActions().setCategorys;
  const scrollviewRef = useRef<ScrollView>(null);

  const clickToSkip = async (index: number) => {
    console.log(`currentplaylistid: ${getCurrentPlayListID}`);
    if (!!token) {
      let song = songs[index]; // song in original album
      console.log(`index ): ${index}`);
      // let currentTracks = await TrackPlayer.getActiveTrack();
      // if (!!currentTracks && currentTracks.id === song.id) {
      //   await TrackPlayer.play();
      //   return;
      // }
      let queue = await TrackPlayer.getQueue(); // current queue

      if (getCurrentPlayListID === `Explore${selected}`) {
        console.log(
          `shuffleMode: ${shuffleList.includes(`Explore${selected}`)}`
        );
        if (!shuffleList.includes(`Explore${selected}`)) {
          (queue.length === 0 || queue.length !== songs.length) &&
            (await TrackPlayer.setQueue(songs));
          await TrackPlayer.skip(index, 0);
          await TrackPlayer.play();
        } else {
          let shuffleSongs = shuffle(songs);
          let indexInQueue =
            queue.length === songs.length
              ? queue.findIndex((s) => s.id === song.id)
              : shuffleSongs.findIndex((s) => s.id === song.id);
          queue.length !== songs.length &&
            (await TrackPlayer.setQueue(shuffleSongs));
          console.log(`indexInQueue: ${indexInQueue}`);
          await TrackPlayer.skip(indexInQueue, 0);
          await TrackPlayer.play();
        }
      } else {
        console.log("here");

        setCurrentPlayListID(`Explore${selected}`);
        setCurrentPlayList(songs);
        await TrackPlayer.reset();
        let newSongs = shuffleList.includes(`Explore${selected}`)
          ? [song].concat(shuffle(songs).filter((s) => s.id !== song.id))
          : songs;
        let i = newSongs.findIndex((s) => s.id === song.id);
        await TrackPlayer.setQueue(newSongs);
        await TrackPlayer.skip(i, 0);
        await TrackPlayer.play();
      }
    } else {
      navigation.push("Auth.signin");
    }
  };

  const getAllCategory = useQuery<Category[]>({
    queryKey: ["all_category"],
    queryFn: HomeService.getCategoryList,
  });

  const getPlayListByCategory = useInfiniteQuery<PlayListResponseData>({
    queryKey: ["play_list_by_category", selected],
    queryFn: ({
      pageParam = 1,
      pageSize = [7, 8, 9].includes(selected) ? 4 : 8,
    }: {
      pageParam?: number;
      pageSize?: number;
    }) =>
      HomeService.getPlayListByCategory({
        id: selected.toString(),
        page: pageParam,
        perPage: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.page + 1 > lastPage.total ? false : lastPage.page + 1;
    },
  });

  const _onMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const isCloseToBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >
      nativeEvent.contentSize.height - 30;
    if (isCloseToBottom) {
      if (
        getPlayListByCategory.data?.pages[
          getPlayListByCategory.data?.pages.length - 1
        ].is_more !== 0 &&
        getPlayListByCategory.hasNextPage
      )
        getPlayListByCategory.fetchNextPage().catch();
    }
  };

  useEffect(() => {
    if (getPlayListByCategory.isSuccess) {
      setIsLoading(false);
    }
    if (getPlayListByCategory.isError) {
      setIsError(true);
      setIsLoading(false);
    }
    if (getPlayListByCategory.isFetching) {
      setIsLoading(true);
    }
  }, [
    getPlayListByCategory.isError,
    getPlayListByCategory.isSuccess,
    getPlayListByCategory.isFetching,
  ]);

  useEffect(() => {
    getPlayListByCategory.isError && setIsError(true);
  }, [selected, getPlayListByCategory.isError]);

  useEffect(() => {
    setSelected(!!route.params?.id ? route.params.id : 1);
  }, [route.params]);

  useEffect(() => {
    if (getAllCategory.isSuccess) {
      setCategorys(getAllCategory.data);
    }
  }, [getAllCategory.isSuccess]);

  useEffect(() => {
    if (scrollviewRef.current !== null) {
      scrollviewRef?.current.scrollTo({
        y: 0,
        animated: true,
        x: categorys.findIndex((item) => item.id === selected) * width * 0.2,
      });
    }
  }, [selected]);

  const formatSongs = useMemo(() => {
    let newLists: Song[] = [];
    flatMap(getPlayListByCategory.data?.pages, (page) => {
      newLists = newLists.concat(page.list as Song[]);
    });
    console.log(`length: ${newLists.length}`);

    return newLists;
  }, [
    selected,
    getPlayListByCategory.data?.pages,
    getPlayListByCategory.isSuccess,
  ]);

  useEffect(() => {
    formatSongs.length > 0 &&
      formatTrack(formatSongs).then((res) => {
        setSongs(res);
      });
  }, [formatSongs]);

  return (
    <View style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/explore_page.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View style={styles.header}>
        <Text style={styles.header_font}>Explore</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginVertical: 24,
          flexGrow: 0,
          minHeight: 40,
        }}
        contentContainerStyle={{ paddingRight: 24 }}
        ref={scrollviewRef}
      >
        {categorys.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={{}}
            onPress={() => setSelected(item.id)}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                maxHeight: 33,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 100,
                borderWidth: 1,
                marginLeft: index === 0 ? 24 : 10,
                backgroundColor:
                  selected === item.id
                    ? generalProperties.primary
                    : "rgba(0,0,0,0)",
                borderColor: selected !== item.id ? "#ffffff" : "rgba(0,0,0,0)",
              }}
            >
              <Text style={styles.type_selector}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{
          width: "100%",
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{}}
        onMomentumScrollEnd={_onMomentumScrollEnd}
      >
        {getPlayListByCategory.isSuccess &&
          getPlayListByCategory.data.pages.map(
            (_page_data, i) =>
              _page_data.list.length > 0 && (
                <View
                  style={{
                    flexDirection:
                      categorys.find((item) => item.id === selected)?.type ===
                      "song"
                        ? "column"
                        : "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {_page_data.list.map((_item: any, i: number) =>
                    !_item.type ? (
                      <AlbumCard
                        key={"album" + _item.id + i.toString()}
                        value={_item}
                        gapStyle={{ marginBottom: 12 }}
                        type={
                          _item.category_name.split(" ")[0] === "1"
                            ? "hour1"
                            : _item.category_name.split(" ")[0] === "2"
                            ? "hour2"
                            : "hour4"
                        }
                        navigation={navigation}
                        from_navigation="Explore"
                      />
                    ) : (
                      <ExploreListItem
                        value={_item}
                        key={`Explore${selected},Song${_item.id}`}
                        press={() =>
                          clickToSkip(songs.findIndex((s) => s.id === _item.id))
                        }
                        type={`Explore${selected}`}
                        containerStyle={{
                          marginBottom:
                            i === _page_data.list.length - 1 ? 8 : 12,
                        }}
                      />
                    )
                  )}
                  {
                    // ad
                  }
                  {userInfo.is_member === 0 && (
                    <TouchableOpacity
                      style={{
                        width: "100%",
                        alignItems: "center",
                        paddingBottom: [7, 8, 9].includes(selected) ? 12 : 8,
                      }}
                    >
                      <BannerAd
                        unitId={adUnitId}
                        size={
                          [7, 8, 9].includes(selected)
                            ? BannerAdSize.MEDIUM_RECTANGLE
                            : BannerAdSize.BANNER
                        }
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

        <View
          style={{
            width: "100%",
            marginBottom: generalProperties.tabPlayerHeight + 24,
            // +generalProperties.tabHeight,
          }}
        ></View>
      </ScrollView>
    </View>
  );
};

export default Explore;

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
  type_selector: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "regular",
    color: "#ffffff",
    lineHeight: 20,
    letterSpacing: -0.48,
  },
});
