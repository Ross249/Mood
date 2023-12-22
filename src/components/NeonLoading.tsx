import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { NeonLoadingProps } from "../types/component";
import { StatusBar } from "expo-status-bar";
import { useAssets } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";
import WebView from "react-native-webview";

/**
 * neon loading
 * @param props
 * @returns
 */
const NeonLoading = (props: NeonLoadingProps) => {
  const [html, setHtml] = useState("");
  const [index, indexLoadingError] = useAssets(
    require("../../assets/animated_icons/index.html")
  );

  if (index) {
    readAsStringAsync(index[0].localUri as string).then((data) => {
      setHtml(data);
    });
  }

  //   useEffect(() => {
  //     console.log(html);
  //     console.log("aaa");
  //   }, [html]);

  return (
    <Modal visible={props.visible} animationType="fade" transparent>
      <StatusBar backgroundColor="rgba(0,0,0,0.6)" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0)",
        }}
      >
        {html.length > 0 && (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <WebView
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0)" }}
              //   onLoad={() => console.log("loading")}
              //   onLoadEnd={() => console.log("finish")}
              source={{ html }}
              javaScriptEnabled
              originWhitelist={["*"]}
            />
          </View>
        )}
        {/* <TouchableOpacity
          onPress={() => props.setVisible(false)}
          style={{ marginBottom: 60 }}
        >
          <Text style={{ color: "white" }}>Hide</Text>
        </TouchableOpacity> */}
      </View>
    </Modal>
  );
};

export default NeonLoading;

const styles = StyleSheet.create({});
