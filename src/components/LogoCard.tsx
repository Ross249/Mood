import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import React from "react";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const LogoCard = () => {
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        marginTop: 0.06 * height,
      }}
    >
      <Image
        source={require("../../assets/banner/mood1.png")}
        style={{
          width: width * 0.4,
          height: width * 0.4 * 0.3,
          resizeMode: "contain",
        }}
      />
      <View style={{ marginTop: 32, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "regular",
            fontWeight: "600",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Welcome to MOOD Lofi Music
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 14,
            fontFamily: "light",
            color: "#fff",
          }}
        >
          Create an account to get started on your lofi music journey.
        </Text>
      </View>
    </View>
  );
};

export default LogoCard;

const styles = StyleSheet.create({});
