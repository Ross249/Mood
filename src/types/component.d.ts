import { ReactDOM } from "react";
import { TextStyle, ViewStyle } from "react-native";
import { Tree } from "./example";
import { PlayList, Song, SubscriptionItems } from "./response";
import { RootStackScreenProps, RootTabScreenProps } from "./global";
import { NavigationProp } from "@react-navigation/native";
import { CreateOrderRequest } from "./request";
import { Subscription } from "react-native-iap";

/**
 * UI props type
 */
export type NeonLoadingProps = {
  visible: boolean;
  setVisible: (n: boolean) => void;
};

export type BannerProps = {
  navigation: NavigationProp;
};

export type MiniPlayerProps = {
  onPress: () => void;
  navigation: NavigationProp;
};

export type SvgLinearGradientProps = {
  fill: string;
  height?: number | string;
  end_color?: string;
};

export type HorizonListProps = {
  type: "new" | "most" | "hour1" | "hour2" | "hour4" | "category";
  tag: "recommend" | "hour"; // 控制展示的卡片
  data: Song[] | PlayList[];
  navigation: NavigationProp;
};

export type PromoteCardProps = {
  value: Song;
  type?: string;
  gapStyle?: ViewStyle;
  press: () => void;
  containerStyle?: ViewStyle;
};

export type AlbumCardProps = {
  value: PlayList;
  type?: string;
  gapStyle?: ViewStyle;
  navigation: NavigationProp;
  from_navigation: "Home" | "Explore" | "MyPlayList";
};

export type CircularPackingProps = {
  width: number;
  height: number;
  data: Tree;
};

export type BarplotProps = {
  width: number;
  height: number;
  data: { x: string; value: number; tooltip: string; interval: strng[] }[];
  setTitleOpacity: (n: boolean) => void;
};

export type TooltipTextProps = {
  content: string;
  TextStyle?: TextStyle;
};

export type SettingItemProps = {
  press: () => void;
  icon: "ac" | "sb" | "sq" | "toc" | "pp" | "contact" | "rate" | "share";
  title: string;
};

export type StreamQualityType = {
  // 0-standard, 1-medium, 2-normal, 3-high, 4-very high
  wifi: 0 | 1 | 2 | 3 | 4;
  nexus: 0 | 1 | 2 | 3 | 4;
};

export type SoundQualityProps = {
  select: boolean;
  press: () => void;
  title: string;
  sub_title: string;
};

export type paymentModal = CreateOrderRequest & { close: () => void };

export type SubScriptionCard = {
  setSelected: (n: Subscription) => void;
  selected: Subscription | undefined;
  // items: SubscriptionItems;
  items: Subscription;
  index: number;
};

export type ADBanner = {
  width: number;
  height: number;
  containerStyle?: ViewStyle;
  boxStyle?: ViewStyle;
};

export type ProgressBar = {
  position: number;
  duration: number;
};

export type PlayerFunctions = {
  shuffle: () => void;
  shuffled: boolean;
};
