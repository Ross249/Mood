import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import colors from "../common/colors";
import globalState from "../common/globalState";
import { Feather, Ionicons } from "@expo/vector-icons";
import { generalProperties } from "../common/constant";

const PlayListItem = ({
  songData,
  state,
  press,
}: {
  songData: any;
  state: boolean;
  press: () => void;
}) => {
  const activeColor = colors.brandPrimary;

  return (
    <TouchableOpacity
      style={styles.container}
      key={songData.title}
      onPress={press}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: songData.album_cover }} style={styles.image} />
        <Text style={styles.image_text}>{songData.title}</Text>
      </View>
      {state && (
        <Image
          source={require("../../assets/icons/playing.gif")}
          style={{ width: 20, height: 20, resizeMode: "contain" }}
        />
      )}
    </TouchableOpacity>
  );
};

export default PlayListItem;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: generalProperties.paddingX,
    paddingBottom: generalProperties.paddingX1,
    width: "100%",
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 2,
    backgroundColor: generalProperties.secondary,
  },
  image_text: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
  title: {
    ...globalState.textSpotify16,
    color: colors.white,
    marginBottom: 4,
  },
  circleDownloaded: {
    alignItems: "center",
    backgroundColor: colors.brandPrimary,
    borderRadius: 7,
    height: 14,
    justifyContent: "center",
    marginRight: 8,
    width: 14,
  },
  artist: {
    ...globalState.textSpotify12,
    color: colors.greyInactive,
  },
  containerRight: {
    alignItems: "flex-end",
    flex: 1,
  },
});
