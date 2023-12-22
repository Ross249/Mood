import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TooltipTextProps } from "../types/component";

const TooltipText = (props: TooltipTextProps) => {
  return <Text style={[styles.text, props.TextStyle]}>{props.content}</Text>;
};

export default TooltipText;

const styles = StyleSheet.create({
  text: {
    fontSize: 10,
    fontFamily: "regular",
    color: "#fff",
    flexWrap: "wrap",
  },
});
