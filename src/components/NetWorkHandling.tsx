import {
  StyleSheet,
  Text,
  View,
  Modal,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import { NeonLoadingProps } from "../types/component";

const width = Dimensions.get("screen").width;
/**
 * network handling message
 */
const NetWorkHandling = (props: NeonLoadingProps) => {
  useEffect(() => {
    let timer = setTimeout(() => {
      if (props.visible) {
        props.setVisible(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [props.visible]);
  return (
    <Modal visible={props.visible} animationType="fade" transparent>
      <StatusBar backgroundColor="rgba(0,0,0,0.6)" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View
          style={{
            maxWidth: width * 0.51467,
            padding: 28,
            backgroundColor: "#333333",
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../assets/icons/wifi.png")}
            style={{ width: 60, height: 60, resizeMode: "contain" }}
          />
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              fontWeight: "400",
              color: "#fff",
              textAlign: "center",
            }}
          >
            Network Fail
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              fontWeight: "400",
              color: "#fff",
              textAlign: "center",
            }}
          >
            Please try again later
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default NetWorkHandling;

const styles = StyleSheet.create({});
