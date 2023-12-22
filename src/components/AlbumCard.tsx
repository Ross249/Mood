import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AlbumCardProps } from "../types/component";
import { generalProperties } from "../common/constant";
import { useQuery } from "@tanstack/react-query";
import { Song } from "../types/response";
import { HomeService } from "../services/Home.serveice";
import {
  useCommoneActions,
  useCurrentPlayListID,
  useShuffleList,
  useShuffleMode,
  useToken,
} from "../store/user";
import TrackPlayer, {
  Track,
  usePlaybackState,
} from "react-native-track-player";
import { API_URL } from "../common/API_URL";
import { shuffle } from "lodash";
import * as Network from "expo-network";
import { formatTrack } from "../common/utils";

const width = Dimensions.get("window").width;
/**
 * home page album card (1 hour, 2 hours, 4 hours)
 * @param props
 * @returns
 */
const AlbumCard = (props: AlbumCardProps) => {
  const shuffleList = useShuffleList();
  const token = useToken();
  const [trigger, setTrigger] = useState(false);
  const getCurrentPlayListID = useCurrentPlayListID();
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const [songs, setSongs] = useState<Track[]>([]);
  const playState = usePlaybackState();

  // get playlist
  const getSongList = useQuery<Song[]>({
    queryKey: ["songs", props.value.id],
    queryFn: () =>
      HomeService.getPlayListDetail({ id: props.value.id.toString() }),
    enabled: !!token && !!props.value.id && trigger,
  });

  const clickForPlaying = async () => {
    // no login user will be sent to sign in page
    if (!!token) {
      setTrigger(true);
      console.log(props.value.id);
      console.log(getCurrentPlayListID);

      /**
       * user in current playlist ? pause current playlist
       * not in ? change current id and put new songs to play queue
       */
      if (
        props.value.id === getCurrentPlayListID &&
        getCurrentPlayListID !== 0 &&
        playState.state === "playing"
      ) {
        await TrackPlayer.pause();
      } else {
        if (props.value.id !== getCurrentPlayListID) {
          console.log("different id");
          console.log(songs.length);
          setCurrentPlayListID(props.value.id);
        } else {
          console.log("the same id");
          await TrackPlayer.play();
        }
      }
    } else {
      props.navigation.navigate("Auth.signin");
    }
  };

  const setQueue = async () => {
    console.log("queue");

    if (getCurrentPlayListID === props.value.id && songs.length > 0) {
      await TrackPlayer.reset();
      setCurrentPlayList(songs);
      if (shuffleList.includes(props.value.id)) {
        await TrackPlayer.setQueue(shuffle(songs));
      } else {
        await TrackPlayer.setQueue(songs);
      }
      await TrackPlayer.play();
    }
  };

  // if use click button between album cards not album inside
  useEffect(() => {
    getSongList.isSuccess &&
      getCurrentPlayListID !== 0 &&
      getCurrentPlayListID === props.value.id &&
      setQueue();
  }, [getCurrentPlayListID, getSongList.isSuccess, trigger]);

  // monitor query stage and format song track
  useEffect(() => {
    if (getSongList.isError) {
      setTrigger(false);
    }
    if (getSongList.isSuccess) {
      formatTrack(getSongList.data).then((res) => {
        setSongs(res);
        setTrigger(false);
      });
    }
  }, [getSongList.isSuccess, getSongList.isError]);

  return (
    <TouchableOpacity
      style={[props.gapStyle]}
      key={props.value.id}
      onPress={() => {
        !!token
          ? props.navigation.navigate("Album", {
              album_id: props.value.id,
              album_name: props.value.name,
              album_cover: props.value.cover,
              is_like: props.value.is_like,
              category_name: props.value.category_name,
              from_navigation: props.from_navigation,
            })
          : props.navigation.navigate("Auth.signin");
      }}
    >
      <Image
        source={{ uri: props.value.cover }}
        style={{
          width: width * 0.42,
          height: width * 0.42 * 1.265,
          borderRadius: 8,
        }}
      />

      <View style={styles.floatView}>
        <Text style={styles.f_title}>{props.value.name}</Text>
        <View style={styles.bottom}>
          <View
            style={{
              ...styles.bottom_font_container,
              backgroundColor:
                props.type === "hour1"
                  ? generalProperties.primary
                  : props.type === "hour2"
                  ? generalProperties.secondary1
                  : generalProperties.secondary2,
            }}
          >
            <Text style={styles.bottom_font}>
              {props.type === "hour1"
                ? "1 hour"
                : props.type === "hour2"
                ? "2 hours"
                : "4 hours"}
            </Text>
          </View>

          <TouchableOpacity onPress={clickForPlaying}>
            {["playing", "loading", "buffering", "ready"].includes(
              playState.state as string
            ) &&
            getCurrentPlayListID !== 0 &&
            getCurrentPlayListID === props.value.id ? (
              <Image
                source={require("../../assets/icons/pause.png")}
                style={{ width: 32, height: 32, resizeMode: "contain" }}
              />
            ) : (
              <Image
                source={require("../../assets/icons/play.png")}
                style={{ width: 32, height: 32, resizeMode: "contain" }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(AlbumCard);

const styles = StyleSheet.create({
  floatView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // width: width * 0.42,
    // height: width * 0.42 * 1.265,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  f_title: {
    flexWrap: "wrap",
    fontFamily: "bold",
    fontWeight: "100",
    color: "#ffffff",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bottom_font_container: {
    justifyContent: "center",
    alignItems: "baseline",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 200,
    gap: 10,
  },
  bottom_font: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 14,
    fontFamily: "regular",
  },
});
