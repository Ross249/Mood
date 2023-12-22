import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { PromoteCardProps } from "../types/component";
import { songsList } from "../example/songs";
import TrackPlayer, { Track } from "react-native-track-player";
import { API_URL } from "../common/API_URL";
import {
  useCommoneActions,
  useCurrentPlayList,
  useCurrentPlayListID,
  useShuffleList,
  useToken,
} from "../store/user";
import { generalProperties } from "../common/constant";
import * as Network from "expo-network";
import { shuffle } from "lodash";
import { Song } from "../types/response";

/**
 * new, most people listen card
 * @param props
 * @returns
 */
const width = Dimensions.get("screen").width;
const PromoteCard = (props: PromoteCardProps) => {
  return (
    <TouchableOpacity
      style={[props.gapStyle]}
      key={props.value.id}
      onPress={props.press}
    >
      <Image
        source={{ uri: props.value.album_cover }}
        style={{
          width: width * 0.352,
          height: width * 0.352,
          resizeMode: "contain",
          borderRadius: 2,
          backgroundColor: generalProperties.secondary,
        }}
      />
      <Text
        style={{
          fontSize: 14,
          fontFamily: "bold",
          fontWeight: "600",
          marginTop: 4,
          color: "#ffffff",
          maxWidth: width * 0.352,
        }}
      >
        {props.value.title}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(PromoteCard);

const styles = StyleSheet.create({});
