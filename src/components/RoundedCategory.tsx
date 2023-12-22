import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from "react-native";
import React from "react";

const width = Dimensions.get("screen").width;
const RoundedCategory = ({
  image,
  index,
  title,
  press,
}: {
  image: string;
  index: number;
  title: string;
  press: () => void;
}) => {
  return (
    <TouchableOpacity
      style={{
        borderRadius: 5000,
        borderWidth: 1,
        marginBottom: 12,
        overflow: "hidden",
        borderColor: "#ffffff",
        // marginHorizontal: index % 3 === 1 ? 12 : 0,
      }}
      onPress={press}
    >
      <Image
        source={{ uri: image }}
        style={{
          width: width * 0.275,
          height: width * 0.275,
          borderRadius: 5000,
          resizeMode: "stretch",
          overflow: "hidden",
        }}
      />
      <View style={styles.float_view_container}>
        <Text style={styles.float_view_font}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RoundedCategory;

const styles = StyleSheet.create({
  float_view_container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 4000,
  },
  float_view_font: {
    fontSize: 14,
    fontFamily: "bold",
    fontWeight: "100",
    color: "#ffffff",
  },
});
