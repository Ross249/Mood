import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { HorizonListProps } from "../types/component";
import PromoteCard from "./PromoteCard";
import { generalProperties, homepageImage } from "../common/constant";
import { songsList } from "../example/songs";
import AlbumCard from "./AlbumCard";
import { PlayList, Song } from "../types/response";
import { API_URL } from "../common/API_URL";
import * as Network from "expo-network";
import TrackPlayer, { Track } from "react-native-track-player";
import {
  useCommoneActions,
  useCurrentPlayListID,
  useShuffleList,
  useToken,
} from "../store/user";
import { shuffle } from "lodash";
import { formatTrack } from "../common/utils";

/**
 * horizon swipe container
 * @param props
 * @returns
 */
const HorizonList = (props: HorizonListProps) => {
  const token = useToken();
  const [songs, setSongs] = useState<Track[]>([]);
  const getCurrentPlayListID = useCurrentPlayListID();
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const shuffleList = useShuffleList();
  // title image
  const [image, setImage] = useState(() => {
    switch (props.type) {
      case "new":
        return "New";
      case "most":
        return "Most people listen";
      case "hour1":
        return "1 hour lofi";
      case "hour2":
        return "2 hour lofi";
      case "hour4":
        return "4 hour lofi";
      case "category":
        return homepageImage.Category;
      default:
        return require("../../assets/banner/new.png");
    }
  });

  const current_id = () => {
    if (
      props.data.length > 0 &&
      props.tag !== "recommend" &&
      Object.prototype.hasOwnProperty.call(props.data[0], "category_id")
    ) {
      switch (props.type) {
        case "hour1":
          return !!props.data[0]?.category_id ? props.data[0]?.category_id : 7;
        case "hour2":
          return !!props.data[0]?.category_id ? props.data[0]?.category_id : 8;
        case "hour4":
          return !!props.data[0]?.category_id ? props.data[0]?.category_id : 9;
        default:
          return 7;
      }
    } else {
      return 1;
    }
  };

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

      if (getCurrentPlayListID === "Home." + props.type) {
        console.log(
          `shuffleMode: ${shuffleList.includes("Home." + props.type)}`
        );
        if (!shuffleList.includes("Home." + props.type)) {
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

        setCurrentPlayListID("Home." + props.type);
        setCurrentPlayList(songs);
        await TrackPlayer.reset();
        let newSongs = shuffleList.includes("Home." + props.type)
          ? [song].concat(shuffle(songs).filter((s) => s.id !== song.id))
          : songs;
        let i = newSongs.findIndex((s) => s.id === song.id);
        await TrackPlayer.setQueue(newSongs);
        await TrackPlayer.skip(i, 0);
        await TrackPlayer.play();
      }
    } else {
      props.navigation.navigate("Auth.signin");
    }
  };

  useEffect(() => {
    formatTrack(props.data as Song[]).then((res) => {
      setSongs(res);
    });
  }, [props.data]);

  return (
    <View
      style={{
        width: "100%",
        marginTop: 20,
      }}
    >
      <View style={styles.h_header}>
        <Text style={styles.title}>{image}</Text>
        {props.tag !== "recommend" && (
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("Explore", {
                id: current_id(),
              });
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                lineHeight: 20,
                color: "#ffffff",
                fontFamily: "regular",
              }}
            >
              View all
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginTop: 20,
          paddingBottom: 16,
        }}
        contentContainerStyle={{
          paddingRight: 24,
        }}
      >
        {props.data.length > 0 &&
          props.data.map((item, index) =>
            props.tag === "recommend" ? (
              <PromoteCard
                key={item.id}
                gapStyle={{ marginLeft: index === 0 ? 24 : 8, borderRadius: 8 }}
                value={item as Song}
                press={() =>
                  clickToSkip(songs.findIndex((s) => s.id === item.id))
                }
                type={props.type}
              />
            ) : (
              <AlbumCard
                key={item.id}
                gapStyle={{ marginLeft: index === 0 ? 24 : 8, borderRadius: 8 }}
                navigation={props.navigation}
                value={item as PlayList}
                type={props.type}
                from_navigation="Home"
              />
            )
          )}
      </ScrollView>
    </View>
  );
};

export default HorizonList;

const styles = StyleSheet.create({
  h_header: {
    paddingHorizontal: generalProperties.paddingX,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontFamily: "dotty",
    fontSize: 40,
    color: "white",
    letterSpacing: -1.2,
  },
});
