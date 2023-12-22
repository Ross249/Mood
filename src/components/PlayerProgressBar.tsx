import { Dimensions, StyleSheet, Text, View, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { format } from "../common/utils";
import Slider from "@react-native-community/slider";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  useActiveTrack,
} from "react-native-track-player";
import { generalProperties } from "../common/constant";
import { ProgressBar } from "../types/component";

const width = Dimensions.get("screen").width;
const PlayerProgressBar = (props: ProgressBar) => {
  const [progress, setProgress] = useState({
    position: props.position,
    duration: props.duration,
  });
  const { position, duration } = useProgress();
  const playbackState = usePlaybackState();
  const events = [Event.PlaybackProgressUpdated];
  useTrackPlayerEvents(events, (event) => {
    if (event.type === Event.PlaybackProgressUpdated) {
      setProgress({
        position: event.position,
        duration: event.duration,
      });
    }
  });

  useEffect(() => {
    playbackState.state === "paused" &&
      setProgress({ position: position, duration: duration });
  }, [position, playbackState.state]);

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 14,
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      {
        // slider
      }
      <Slider
        style={{
          width: ((width as number) -
            (Platform.OS === "ios" ? 48 : 17)) as number,
          height: 20,
          alignSelf: "center",
        }}
        minimumValue={0}
        maximumValue={progress.duration}
        thumbTintColor={"#fff"}
        value={progress.position}
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
          await TrackPlayer.play();
        }}
        tapToSeek={true}
        minimumTrackTintColor={generalProperties.primary}
        maximumTrackTintColor="#6B6B6B"
      />
      {
        // current time and end time
      }
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignSelf: "center",
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ color: "white" }}>{format(progress.position)}</Text>
        <Text style={{ color: "white" }}>{format(progress.duration)}</Text>
      </View>
    </View>
  );
};

export default PlayerProgressBar;

const styles = StyleSheet.create({});
