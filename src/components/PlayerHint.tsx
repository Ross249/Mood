import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { NeonLoadingProps } from "../types/component";
import { useUserInfo } from "../store/user";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const PlayerHint = (
  props: NeonLoadingProps & { time: number; text: string }
) => {
  const info = useUserInfo();
  useEffect(() => {
    let timer = setTimeout(() => {
      if (props.visible) {
        props.setVisible(false);
      }
    }, props.time);
    return () => clearTimeout(timer);
  }, [props.visible]);
  return (
    <View
      style={{
        position: "absolute",
        width: width - 32,
        top: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginHorizontal: 16,
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        opacity: props.visible ? 1 : 0,
        zIndex: 190,
      }}
    >
      <Ionicons name="ios-checkmark-circle" size={20} color="white" />
      <Text style={{ ...styles.timer_text, marginLeft: 8 }}>{props.text}</Text>
    </View>
  );
};

export default PlayerHint;

const styles = StyleSheet.create({
  timer_text: {
    fontFamily: "regular",
    fontSize: 14,
    color: "#fff",
  },
});
