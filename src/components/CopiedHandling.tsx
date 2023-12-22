import { StyleSheet, Text, View, Modal, Dimensions, Image } from "react-native";
import React, { useEffect } from "react";
import { NeonLoadingProps } from "../types/component";
import { StatusBar } from "expo-status-bar";

const width = Dimensions.get("screen").width;
/**
 * copied modal
 * @param props
 * @returns
 */
const CopiedHandling = (props: NeonLoadingProps) => {
  useEffect(() => {
    let timer = setTimeout(() => {
      if (props.visible) {
        props.setVisible(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [props.visible]);
  return (
    <Modal visible={props.visible} animationType="fade" transparent>
      <StatusBar backgroundColor="rgba(0,0,0,0.0)" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0)",
        }}
      >
        <View
          style={{
            minWidth: width * 0.375,
            minHeight: 96,
            paddingVertical: 24,
            backgroundColor: "#333333",
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../assets/icons/copied.png")}
            style={{ width: 32, height: 32, resizeMode: "contain" }}
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
            Copied
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default CopiedHandling;

const styles = StyleSheet.create({});
