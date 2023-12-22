import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList, RootTabScreenProps } from "../../types/global";
import Home from "./Home";
import Explore from "./Explore";
import PlayList from "./PlayList";
import { generalProperties } from "../../common/constant";
import { useCommoneActions } from "../../store/user";
import CustomTabBar from "../../components/CustomTabBar";
import Album from "../Home/Album";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
const BottomTab = createBottomTabNavigator<RootTabParamList>();

export default function Tab() {
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: generalProperties.tabHeight,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <BottomTab.Screen
        name="Home"
        component={Home}
        options={({ navigation }: RootTabScreenProps<"Home">) => ({
          title: "home",
          gestureEnabled: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <Image
                source={require("../../../assets/icons/home_active.png")}
                style={styles.icon}
              />
            ) : (
              <Image
                source={require("../../../assets/icons/home.png")}
                style={styles.icon}
              />
            );
          },
        })}
      />
      <BottomTab.Screen
        name="Explore"
        component={Explore}
        options={({ navigation }: RootTabScreenProps<"Explore">) => ({
          title: "explore",
          gestureEnabled: false,
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <Image
                source={require("../../../assets/icons/explore_active.png")}
                style={styles.icon}
              />
            ) : (
              <Image
                source={require("../../../assets/icons/explore.png")}
                style={styles.icon}
              />
            );
          },
        })}
      />
      <BottomTab.Screen
        name="MyPlayList"
        component={PlayList}
        options={({ navigation }: RootTabScreenProps<"MyPlayList">) => ({
          title: "playlist",
          tabBarLabel: "My Playlist",
          gestureEnabled: false,
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <Image
                source={require("../../../assets/icons/playlist_active.png")}
                style={styles.icon}
              />
            ) : (
              <Image
                source={require("../../../assets/icons/playlist.png")}
                style={styles.icon}
              />
            );
          },
        })}
      />
      <BottomTab.Screen
        name="Album"
        component={Album}
        options={({ navigation }: RootTabScreenProps<"Album">) => ({
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          animation: "slide_from_right",
          animationTypeForReplace: "pop",
          gestureEnabled: false,
        })}
      />
    </BottomTab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
  },
});
