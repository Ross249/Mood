import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { generalProperties } from "../common/constant";
import { BannerProps } from "../types/component";
import { useToken } from "../store/user";

const width = Dimensions.get("screen").width;
/**
 * Top ticket for subscribe
 * @returns
 */
const Banner = ({ navigation }: BannerProps) => {
  const [height, setHeight] = useState(0);
  const token = useToken();
  return (
    <View style={styles.ticket}>
      <View
        style={styles.ticket_container}
        onLayout={(e) => {
          setHeight(e.nativeEvent.layout.height);
        }}
      >
        <View style={styles.ticket_info}>
          <Text
            numberOfLines={1}
            style={{
              fontWeight: "bold",
              lineHeight: 20,
              fontSize: 18,
              marginBottom: 8,
              color: "#ffffff",
              fontFamily: "regular",
            }}
          >
            Unlock you FREE Trial
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="ios-checkmark-circle" size={20} color="white" />
            <Text style={styles.banner_font} numberOfLines={1}>
              Ad-free music listening
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="ios-checkmark-circle" size={20} color="white" />
            <Text style={styles.banner_font} numberOfLines={1}>
              Over 2,000+ lofi musics in the app
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="ios-checkmark-circle" size={20} color="white" />
            <Text style={styles.banner_font} numberOfLines={1}>
              Cancel subscription anytime
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{}}
          onPress={() =>
            !!token
              ? navigation.navigate("User.settings.subscription")
              : navigation.navigate("Auth.signin")
          }
        >
          <Image
            source={require("../../assets/banner/subscribe.png")}
            style={{ height: "100%", width: 42, resizeMode: "cover" }}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{
            ...styles.ticket_button,
            width: height,
            top: 54,
            right: 24,
            transform: [{ rotate: "-90deg" }, { translateY: 78 }],
          }}
        >
          <Text
            style={{
              ...styles.ticket_button_text,
            }}
          >
            subscribe now
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  ticket: {
    marginTop: 24,
    width: width - 48,
    borderWidth: 1,
    borderColor: "#ffffff",
    minHeight: 157,
  },
  ticket_container: {
    marginTop: 12,
    // borderTopWidth: 1,
    // borderColor: "#ffffff",
    flex: 1,
    width: "100%",
    flexDirection: "row",
  },
  ticket_info: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderTopColor: "#ffff",
    borderBottomColor: "rgba(0,0,0,0)",
    borderRightColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  ticket_button: {
    position: "absolute",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderColor: "#ffffff",

    backgroundColor: generalProperties.primary,
  },
  ticket_button_text: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400",
    color: "#ffffff",
    textAlign: "center",
    textTransform: "capitalize",
  },

  banner_font: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "400",
    fontFamily: "regular",
  },
});
