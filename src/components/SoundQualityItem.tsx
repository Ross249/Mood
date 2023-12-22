import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { SoundQualityProps } from "../types/component";
import { Ionicons } from "@expo/vector-icons";

const SoundQualityItem = (props: SoundQualityProps) => {
  return (
    <TouchableOpacity
      style={{
        marginVertical: 14,
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onPress={props.press}
    >
      <View>
        <Text
          style={{
            ...styles.header_text,
            fontSize: 14,
            fontWeight: "400",
          }}
        >
          {props.title}
        </Text>
        <Text
          style={{
            ...styles.header_text,
            fontSize: 10,
            fontWeight: "400",
            color: "rgba(212, 221, 224,0.6)",
          }}
        >
          {props.sub_title}
        </Text>
      </View>
      {props.select && (
        <Ionicons name="ios-checkmark-circle" size={20} color="white" />
      )}
    </TouchableOpacity>
  );
};

export default SoundQualityItem;

const styles = StyleSheet.create({
  header_text: {
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "bold",
    fontSize: 16,
  },
});
