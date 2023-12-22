import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { TabBarProps } from "react-native-tab-view";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import MiniPlayer from "./MiniPlayer";
import { useCommoneActions } from "../store/user";
import { generalProperties } from "../common/constant";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <>
      <MiniPlayer
        onPress={() => {
          navigation.navigate("Player", { tag: "song" });
        }}
        navigation={navigation}
      />
      <View
        style={{
          display: "flex",
          alignItems: "center",
          // backgroundColor: "rgba(17, 17, 27, 0.75)",
          backgroundColor: "black",
          height: generalProperties.tabHeight,
          width: "100%",
          paddingTop: 8,
          flexDirection: "row",
          paddingBottom: 32,

          // position: "absolute",
          // bottom: 0,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const Icon = options.tabBarIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            route.name !== "Album" && (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!!Icon && <Icon focused={isFocused} size={24} color="" />}
                <Text
                  style={{
                    marginTop: !!Icon ? 4 : 0,
                    // lineHeight: 18,
                    fontSize: 13,
                    color: isFocused
                      ? "rgba(255,255,255,1)"
                      : "rgba(212, 221, 224, 0.6)",
                    textAlign: "center",
                    fontFamily: "regular",
                  }}
                >
                  {label as string}
                </Text>
              </TouchableOpacity>
            )
          );
        })}
      </View>
    </>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
