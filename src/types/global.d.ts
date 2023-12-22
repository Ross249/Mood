/**
 * global navigation type
 */
import ToastContainer from "react-native-toast-notifications";
import Toast from "react-native-toast-notifications/lib/typescript/toast";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Track } from "react-native-track-player";

namespace ReactNavigation {
  interface RootParamList extends RootStackParamList {}
}

declare global {
  let Toast: ToastContainer;
  let AppToken: string | null;
}
export type RootStackParamList = {
  Home: undefined;
  Explore: { id: number } | undefined;
  MyPlayList: undefined;
  Index: undefined;
  Player: {
    tag: "song" | "album";
    id: string;
    currentTrack: Track | undefined;
  };
  Album: {
    album_id: number;
    album_cover: string;
    album_name: string;
    is_like: 0 | 1;
    category_name: string;
    from_navigation: "Home" | "Explore" | "MyPlayList";
  };
  Timer: undefined;
  "User.account": undefined;
  "Auth.signin": undefined;
  "Auth.login": undefined;
  "Auth.login.forget": undefined;
  "Auth.login.forget.confirm": { email: string };
  "User.settings": undefined;
  "User.settings.accounts": undefined;
  "User.settings.accounts.delete": undefined;
  "User.settings.subscription": undefined;
  "User.settings.quality": undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  Home: undefined;
  Explore: { id: number } | undefined;
  MyPlayList: undefined;
  Album: {
    album_id: number;
    album_cover: string;
    album_name: string;
    is_like: 0 | 1;
    category_name: string;
    from_navigation: "Home" | "Explore" | "MyPlayList";
  };
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
