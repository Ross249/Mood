import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { generalProperties } from "../common/constant";
import { ClickToShare } from "../common/utils";

const ShareCard = () => {
  return (
    <View style={styles.share_card_container}>
      <View style={styles.share_card}>
        <Text style={styles.share_card_title}>Share MOOD for free</Text>
        <Text style={styles.share_card_content} numberOfLines={4}>
          Help your friends to enjoy the lofi music to chill, focus, study,
          meditation and sleep with 7 days of MOOD, completely free.
        </Text>
        <TouchableOpacity style={styles.share_button} onPress={ClickToShare}>
          <Text style={styles.share_button_text}>Share Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShareCard;

const styles = StyleSheet.create({
  share_card_container: {
    paddingHorizontal: 24,
    width: "100%",
    marginTop: 24,
    // marginBottom: 24 + generalProperties.tabPlayerHeight,
    marginBottom: 32,
  },
  share_card: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 20,
  },
  share_card_title: {
    fontFamily: "regular",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 20,
    color: "#ffffff",
  },
  share_card_content: {
    flex: 1,
    textAlign: "center",
    fontFamily: "regular",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    color: "#ffffff",
    marginVertical: 14,
    flexWrap: "wrap",
  },
  share_button: {
    backgroundColor: generalProperties.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
  },
  share_button_text: {
    fontSize: 16,
    fontFamily: "regular",
    fontWeight: "400",
    lineHeight: 20,
    color: "#ffffff",
  },
});
