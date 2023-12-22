import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import TrackPlayer, {
  RepeatMode,
  usePlaybackState,
} from "react-native-track-player";
import { debounce } from "lodash";
import { generalProperties } from "../common/constant";
import {
  useRepeatMode,
  useCommoneActions,
  useCurrentPlayListID,
  useShuffleList,
} from "../store/user";
import { PlayerFunctions } from "../types/component";

const PlayerFunction = ({ shuffle, shuffled }: PlayerFunctions) => {
  const repeatMode = useRepeatMode();
  const setRepeatMode = useCommoneActions().setRepeatMode;
  const currentplaylistID = useCurrentPlayListID();
  const shuffleList = useShuffleList();
  const [playing, setIsPlaying] = useState(false);
  const playState = usePlaybackState();

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

  const repeatButtonTrigger = async () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        setRepeatMode(RepeatMode.Queue);
        break;
      case RepeatMode.Queue:
        setRepeatMode(RepeatMode.Track);
        break;
      case RepeatMode.Track:
        setRepeatMode(RepeatMode.Off);
        break;
    }
  };

  const playerTrigger = async () => {
    if (playState.state === "playing") {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  useEffect(() => {
    console.log(playState.state);
    if (
      ["playing", "loading", "buffering", "ready"].includes(
        playState.state as string
      )
    ) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [playState.state]);

  return (
    <View style={styles.controls}>
      <Pressable onPress={debounce(shuffle, 1000)}>
        {!shuffled ? (
          <Image
            source={require("../../assets/icons/shuffle.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        ) : (
          <Image
            source={require("../../assets/icons/shuffled.png")}
            style={{ width: 24, height: 28, resizeMode: "contain" }}
          />
        )}
      </Pressable>
      <Pressable onPress={() => preveOrNext("prev")}>
        <Image
          source={require("../../assets/icons/prev.png")}
          style={{ width: 40, height: 40, resizeMode: "contain" }}
        />
      </Pressable>
      <Pressable onPress={playerTrigger}>
        {playing ? (
          <Image
            source={require("../../assets/icons/p_playing.png")}
            style={{ width: 56, height: 56, resizeMode: "contain" }}
          />
        ) : (
          <Image
            source={require("../../assets/icons/p_pause.png")}
            style={{ width: 56, height: 56, resizeMode: "contain" }}
          />
        )}
      </Pressable>
      <Pressable onPress={() => preveOrNext("next")}>
        <Image
          source={require("../../assets/icons/next.png")}
          style={{ width: 40, height: 40, resizeMode: "contain" }}
        />
      </Pressable>
      <Pressable onPress={repeatButtonTrigger}>
        {repeatMode === RepeatMode.Off && (
          <Image
            source={require("../../assets/icons/repeat.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        )}
        {repeatMode === RepeatMode.Track && (
          <Image
            source={require("../../assets/icons/repeat_current.png")}
            style={{ width: 24, height: 28, resizeMode: "contain" }}
          />
        )}
        {repeatMode === RepeatMode.Queue && (
          <Image
            source={require("../../assets/icons/repeat_list.png")}
            style={{ width: 24, height: 28, resizeMode: "contain" }}
          />
        )}
      </Pressable>
    </View>
  );
};

export default PlayerFunction;

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: generalProperties.paddingX,
  },
});
