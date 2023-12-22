import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
  Pressable,
} from "react-native";
import { Feather as Icon, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { MiniPlayerProps } from "../types/component";
import { generalProperties } from "../common/constant";
import { songsList } from "../example/songs";
import TrackPlayer, {
  Track,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { WS_URL } from "../common/API_URL";
import BackgroundTimer from "react-native-background-timer";
import {
  useCurrentPlayListID,
  useShuffleList,
  useUserInfo,
} from "../store/user";

const width = Dimensions.get("screen").width;
export default ({ onPress, navigation }: MiniPlayerProps) => {
  const userInfo = useUserInfo();
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [listLength, setListLength] = useState(0); // if queue is empty ? don't show mini player
  const [songDetail, setSongDetail] = useState<Track | undefined>(undefined);
  const activeTrack = useActiveTrack();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const currentplaylistID = useCurrentPlayListID();
  const shuffleList = useShuffleList();
  let heartbeat_msg = `heartbeat`,
    heartbeat_interval: number | null = null,
    missed_heartbeats = 0;
  const playbackState = usePlaybackState();
  const { position, duration, buffered } = useProgress();

  const playOrPause = async () => {
    if (playbackState.state === "playing") {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const preveOrNext = async (tag: "prev" | "next") => {
    switch (tag) {
      case "prev":
        shuffleList.includes(currentplaylistID)
          ? await TrackPlayer.seekTo(0)
          : await TrackPlayer.skipToPrevious();
        await TrackPlayer.play();
        break;
      case "next":
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
        break;
      default:
        break;
    }
  };

  const current = async () => {
    const cu = await TrackPlayer.getActiveTrack();
    if (cu?.id !== songDetail?.id) {
      console.log(cu);
      setSongDetail(cu);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established");

      if (heartbeat_interval === null) {
        missed_heartbeats = 0;
        heartbeat_interval = BackgroundTimer.setInterval(function () {
          try {
            missed_heartbeats++;
            if (missed_heartbeats >= 3) {
              throw Error("Too many missed heartbeats.");
            }
            // console.log("send heartbeat");

            ws.send(heartbeat_msg);
          } catch (e) {
            !!heartbeat_interval &&
              BackgroundTimer.clearInterval(heartbeat_interval);
            heartbeat_interval = null;
            console.warn("Closing");
            ws.close();
            setSocket(null);
          }
        }, 5000);
      }
    };
    setSocket(ws);
    ws.onmessage = (message: MessageEvent) => {
      // console.log("Received message:", message.data);
      if (message.data === heartbeat_msg) {
        missed_heartbeats = 0;
        return;
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
      ws.close();
      setSocket(null);
    };

    ws.onclose = (e) => {
      console.log(
        "Socket is closed. Reconnect will be attempted in 1 second.",
        e.reason
      );
      setTimeout(function () {
        connectWebSocket();
      }, 1000);
    };
  };

  // monitor song current playing and queue length for getting newest data
  useEffect(() => {
    current();

    const getQueueLength = async () => {
      const queue = await TrackPlayer.getQueue(); // Get the current queue
      const aIndex = await TrackPlayer.getActiveTrackIndex();
      const queueLength = queue.length; // Get the length of the queue
      setListLength(queueLength);
      setActiveIndex(aIndex);
    };
    getQueueLength();
  }, [playbackState, position]);

  useEffect(() => {
    const intervalId = BackgroundTimer.setInterval(function () {
      if (!!socket && playbackState.state === "playing" && !!songDetail) {
        // console.log(`send ${Date.now()}`);

        try {
          socket.send(
            JSON.stringify({
              member_id: userInfo.uid,
              id: activeTrack?.id,
              genre: activeTrack?.genre,
              time: new Date().valueOf(),
            })
          );
        } catch (error) {
          console.log(error instanceof Error ? error.message : error);
        }
      }
    }, 1000);
    if (playbackState.state !== "playing") {
      BackgroundTimer.clearInterval(intervalId);
    }
    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, [playbackState.state, activeTrack]);

  useEffect(() => {
    current();
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.send("bye!bye!");
        socket.close();
        setSocket(null);
      }
    };
  }, []);

  if (
    currentplaylistID === 0 ||
    playbackState.state === "ended" ||
    listLength === 0
  ) {
    return null;
  }

  return (
    <TouchableWithoutFeedback
      {...{
        onPress: () => {
          navigation.navigate("Player", {
            tag: listLength === 1 ? "song" : "album",
            id:
              listLength === 1 && !!activeTrack
                ? activeTrack?.id
                : songDetail?.album_id,
            currentTrack: activeTrack,
          });
        },
      }}
    >
      <View style={styles.container}>
        <View style={styles.bar_container}>
          <View style={styles.image_text}>
            <Image
              style={styles.image}
              source={{ uri: activeTrack?.artwork }}
            />
            <Text style={styles.text} numberOfLines={1}>
              {activeTrack?.title}
            </Text>
          </View>
          <View style={styles.image_text}>
            <Pressable
              onPress={() => preveOrNext("prev")}
              hitSlop={{ left: 10 }}
            >
              <Image
                source={require("../../assets/icons/prev.png")}
                style={{ width: 24, height: 24, resizeMode: "cover" }}
              />
            </Pressable>
            {["playing", "loading", "buffering", "ready"].includes(
              playbackState.state as string
            ) ? (
              <Pressable style={{ marginHorizontal: 12 }} onPress={playOrPause}>
                <Image
                  source={require("../../assets/icons/p_playing.png")}
                  style={{ width: 32, height: 32, resizeMode: "contain" }}
                />
              </Pressable>
            ) : (
              <Pressable style={{ marginHorizontal: 12 }} onPress={playOrPause}>
                <Image
                  source={require("../../assets/icons/p_pause.png")}
                  style={{ width: 32, height: 32, resizeMode: "contain" }}
                />
              </Pressable>
            )}
            <Pressable
              onPress={() => preveOrNext("next")}
              hitSlop={{ right: 10 }}
            >
              <Image
                source={require("../../assets/icons/next.png")}
                style={{ width: 24, height: 24, resizeMode: "cover" }}
              />
            </Pressable>
          </View>
        </View>
        <Progress.Bar
          progress={!!duration && !!position ? position / duration : 0}
          width={width - 24}
          height={2}
          unfilledColor={generalProperties.secondary}
          color={generalProperties.primary}
          borderWidth={0}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: generalProperties.tabHeight,
    width: "100%",
    height: generalProperties.tabPlayerHeight,
    backgroundColor: "rgba(17, 17, 27, 0.75)",
    justifyContent: "space-between",
    paddingHorizontal: generalProperties.paddingX1,
  },
  bar_container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  image_text: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 2,
    backgroundColor: generalProperties.secondary,
  },

  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "regular",
    overflow: "hidden",
  },
});
