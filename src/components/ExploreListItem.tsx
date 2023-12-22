import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useMemo } from "react";
import {
  useCommoneActions,
  useCurrentPlayListID,
  useToken,
} from "../store/user";
import TrackPlayer, {
  Track,
  usePlaybackState,
} from "react-native-track-player";
import { PromoteCardProps } from "../types/component";
import { useEffect, useState } from "react";
import { generalProperties } from "../common/constant";

const width = Dimensions.get("screen").width;

const ExploreListItem = (props: PromoteCardProps) => {
  const playbackState = usePlaybackState();
  const getCurrentPlayListID = useCurrentPlayListID();

  const [isPlaying, setIsPlaying] = useState(false); // for rendering playing icon
  const setIsError = useCommoneActions().setIsError;

  // make sure current track matched
  useEffect(() => {
    const getCurrent = async () => {
      const res = await TrackPlayer.getActiveTrack();
      if (res?.id === props.value.id) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    getCurrent();
  }, [playbackState.state]);

  return (
    <TouchableOpacity
      style={[
        {
          width: "100%",
          marginBottom: 12,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        },
        props.containerStyle,
      ]}
      onPress={props.press}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: props.value.album_cover }}
          style={{
            width: width * 0.13867,
            height: width * 0.13867,
            resizeMode: "contain",
            borderRadius: 2,
            backgroundColor: generalProperties.secondary,
          }}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "regular",
            color: "#ffffff",
            marginLeft: 8,
          }}
          numberOfLines={2}
        >
          {props.value.title}
        </Text>
      </View>
      {isPlaying &&
        getCurrentPlayListID === props.type &&
        ["playing", "ready"].includes(playbackState.state as string) && (
          <Image
            source={require("../../assets/icons/playing.gif")}
            style={{ width: 20, height: 20, resizeMode: "contain" }}
          />
        )}
    </TouchableOpacity>
  );
};

export default ExploreListItem;

const styles = StyleSheet.create({});
