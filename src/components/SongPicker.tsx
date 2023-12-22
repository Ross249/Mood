import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { NeonLoadingProps } from "../types/component";
import { songsList } from "../example/songs";
import { generalProperties } from "../common/constant";
import {
  useCommoneActions,
  useCurrentPlayList,
  useCurrentPlayListID,
  useShuffleList,
  useShuffleMode,
  useToken,
} from "../store/user";
import { HomeService } from "../services/Home.serveice";
import { Song } from "../types/response";
import { useQuery } from "@tanstack/react-query";
import TrackPlayer, {
  Track,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
/**
 * modal for picking songs
 * @returns
 */
const SongPicker = (props: NeonLoadingProps) => {
  // current play list id
  const getCurrentPlayListID = useCurrentPlayListID();
  const currentPlayList = useCurrentPlayList();
  const shuffleList = useShuffleList();
  // state for rendering
  const [songs, setSongs] = useState<Track[]>([]);
  const playState = usePlaybackState();
  const [isCurrentIndex, setIsCurrentIndex] = useState<Track | undefined>();
  const progress = useProgress();

  // get hold play queue and set them to state
  const getQueue = async () => {
    const queue = await TrackPlayer.getQueue();

    // setSongs(currentPlayList);
    setSongs(queue);
  };

  // click random song item when need to skip
  const clickToSkip = async (index: number) => {
    console.log(index);
    const cur = songs[index];
    const queue = await TrackPlayer.getQueue();
    if (songs.length > 0 && queue.length > 0) {
      let indexInQueue = queue.findIndex((s) => s.id === cur.id);
      await TrackPlayer.skip(indexInQueue, 0);
      await TrackPlayer.play();
    }
  };

  // get Index for playing icon render
  const currentIndex = async () => {
    let res = await TrackPlayer.getActiveTrack();
    setIsCurrentIndex(res);
  };

  // monitor current play list id when user switch between playlist
  useEffect(() => {
    if (getCurrentPlayListID !== 0) {
      getQueue();
    }
  }, [getCurrentPlayListID, shuffleList, progress.position, playState.state]);

  useEffect(() => {
    if (playState.state === "playing") {
      currentIndex();
    }
  }, [playState.state]);

  return (
    <Modal visible={props.visible} animationType="fade" transparent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          //   backgroundColor: "red",
        }}
        onPress={() => props.setVisible(false)}
      >
        <Pressable
          style={{
            width: width - 48,
            height: height * 0.51,
            backgroundColor: "#281D1C",
            borderRadius: 12,
          }}
          onPress={() => null}
        >
          <View
            style={{
              backgroundColor: "#353A3B",
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              padding: 20,
            }}
          >
            <Text style={{ ...styles.font, fontSize: 14 }}>Playlist</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {songs.map((song, i) => {
              return (
                <TouchableOpacity
                  key={song.id}
                  style={styles.container}
                  onPress={() => clickToSkip(i)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={{ uri: song.artwork }}
                      style={styles.image}
                    />
                    <Text style={styles.image_text}>{song.title}</Text>
                  </View>
                  {playState.state === "playing" &&
                    song.id === isCurrentIndex?.id && (
                      <Image
                        source={require("../../assets/icons/playing.gif")}
                        style={{ width: 20, height: 20, resizeMode: "contain" }}
                      />
                    )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SongPicker;

const styles = StyleSheet.create({
  font: {
    fontFamily: "regular",
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: generalProperties.paddingX1,
    width: "100%",
  },
  image: { width: 52, height: 52, borderRadius: 2 },
  image_text: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
});
