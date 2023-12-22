import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { SettingItemProps } from "../types/component";
import { settingPageImage } from "../common/constant";

const SettingItem = ({ icon, title, press }: SettingItemProps) => {
  const [image, setImage] = useState(() => {
    switch (icon) {
      case "ac":
        return settingPageImage.User;
      case "sb":
        return settingPageImage.Subscription;
      case "sq":
        return settingPageImage.Quality;
      case "toc":
        return settingPageImage.Toc;
      case "pp":
        return settingPageImage.Privacy;
      case "contact":
        return settingPageImage.Contact;
      case "rate":
        return settingPageImage.Rate;
      case "share":
        return settingPageImage.Share;
      default:
        return settingPageImage.User;
    }
  });
  return (
    <Pressable
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
      onPress={press}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={image}
          style={{ width: 28, height: 28, resizeMode: "contain" }}
        />
        <Text
          style={{
            fontSize: 14,
            color: "#fff",
            fontFamily: "regular",
            marginLeft: 20,
          }}
        >
          {title}
        </Text>
      </View>
      <Image
        source={require("../../assets/icons/s_back.png")}
        style={{ width: 28, height: 28, resizeMode: "contain" }}
      />
    </Pressable>
  );
};

export default React.memo(SettingItem, (pre, enxt) => pre.title === enxt.title);

const styles = StyleSheet.create({});
