import {
  StyleSheet,
  Text,
  Image,
  View,
  Animated,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { SubScriptionCard } from "../types/component";
import { generalProperties } from "../common/constant";

const width = Dimensions.get("screen").width;
const SubscriptionCard = (props: SubScriptionCard) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!!props.selected) {
      if (props.items.productId === props.selected?.productId) {
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [props.selected]);

  return (
    <View
      style={{
        width: 0.41 * width,
        height: 0.41 * width * 0.79,
      }}
    >
      {!!props.selected &&
        props.selected.productId === props.items.productId && (
          <Image
            source={require("../../assets/backgrounds/border_effect.png")}
            style={{
              width: 0.41 * width,
              height: 0.41 * width * 0.79,
              position: "absolute",
              transform: [
                {
                  scaleY: 1.08,
                },
                {
                  scaleX: 1.16,
                },
              ],
              top: 0,
              left: 0,
              zIndex: 2,
            }}
          />
        )}
      <View
        key={props.items.productId}
        style={{
          ...styles.sub_container,
          borderColor: "#6B6B6B",

          // transform: [
          //   {
          //     scale: scale,
          //   },
          // ],
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ ...styles.label }}>
            <Text
              style={{
                ...styles.button_text,
                fontSize: 12,
                lineHeight: 15.6,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {props.items.productId[props.items.productId.length - 1] === "y"
                ? "Beast Value"
                : "Premium"}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.sub_decs_layout}
          onPress={() => {
            props.setSelected(props.items);
          }}
        >
          <Text
            style={{
              ...styles.button_text,
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: -0.42,
            }}
          >
            {props.items.productId[props.items.productId.length - 1] === "y"
              ? "Yearly"
              : "Weekly"}
          </Text>
          <Text
            style={{
              ...styles.button_text,
              fontSize: 16,
              marginBottom: 4,
              letterSpacing: -0.48,
              lineHeight: 20,
            }}
          >
            {props.items.productId[props.items.productId.length - 1] === "y"
              ? "HK$14.00/ month"
              : "HK$8.00/ week"}
          </Text>
          <Text
            style={{
              ...styles.button_text,
              fontSize: 10,
              color: "rgba(212, 221, 224,0.6)",
              lineHeight: 15,
              letterSpacing: -0.03,
            }}
          >
            7 day free trial then
          </Text>
          <Text
            style={{
              ...styles.button_text,
              fontSize: 10,
              color: "rgba(212, 221, 224,0.6)",
              lineHeight: 15,
              letterSpacing: -0.03,
            }}
          >
            {props.items.productId[props.items.productId.length - 1] === "y"
              ? "HK$168.00 / year"
              : "HK$8.00 / week"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(SubscriptionCard, (prev, next) => {
  return prev.selected === next.selected;
});

const styles = StyleSheet.create({
  sub_container: {
    display: "flex",
    alignpropss: "flex-start",
    borderRadius: 2,
    borderWidth: 1,
    width: 0.41 * width,
    height: 0.41 * width * 0.79,
    backgroundColor: "#000",
  },
  sub_decs_layout: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button_text: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "400",
  },
  label: {
    flex: 0,
    flexDirection: "row",
    backgroundColor: generalProperties.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
