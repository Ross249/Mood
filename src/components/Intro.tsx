import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import React from "react";
import { NeonLoadingProps } from "../types/component";
import { generalProperties } from "../common/constant";

const width = Dimensions.get("screen").width;
const Intro = (props: NeonLoadingProps) => {
  const closeIntro = () => {
    console.log("click");

    props.setVisible(false);
  };
  return (
    <Modal visible={props.visible} animationType="fade" transparent>
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <Image
          source={require("../../assets/banner/intro.gif")}
          style={{
            width: "100%",
            minHeight: 194,
            minWidth: 375,
            height: width * 0.5172,
            resizeMode: "cover",
            backgroundColor: "black",
          }}
        />
        <View
          style={{
            width: "100%",
            paddingHorizontal: generalProperties.paddingX,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../assets/banner/mood1.png")}
            style={{
              width: "40%",
              minHeight: 45,
              minWidth: 148,
              height: 0.12 * width,
              resizeMode: "contain",
              marginTop: -22.5,
            }}
          />
          <Text
            style={{
              ...styles.button_text,
              marginTop: 42,
              fontSize: 18,
              marginBottom: 24,
            }}
          >
            Welcome to MOOD Lofi Music
          </Text>
          <Pressable style={styles.button} onPress={closeIntro}>
            <Text style={styles.button_text}>Get Start</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default Intro;

const styles = StyleSheet.create({
  button: {
    marginHorizontal: generalProperties.paddingX,
    backgroundColor: generalProperties.primary,
    width: "100%",
    borderRadius: 100,
    marginVertical: 26,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  button_text: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "400",
  },
});
