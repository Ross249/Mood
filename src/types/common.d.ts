import { SharedValue } from "react-native-reanimated";
import { RepeatMode, Track } from "react-native-track-player";
import { Category } from "./response";

/**
 * store type
 */
export type Store = {
  token?: string;
  showPlayer: SharedValue;
  firstTime: boolean; // first time enter this app
  timer: Timer;
  loading: boolean; // global loading
  is_error: boolean; // network error
  userInfo: UserInfo;
  repeatMode: RepeatMode; // player repeat mode;
  shuffleMode: boolean; // player shuffle mode; deprecated
  categorys: Category[];
  currentPlayListID: number | string; // current playing list id
  currentPlayList: Track[];
  soundQualities: SoundQualites;
  rateLinks: RateLinks;
  shuffleLists: (string | number)[];
  likeSongsList: (string | number)[];
  likeAlbumsList: (string | number)[];
  subIndex: 0 | number;
  actions: {
    logout: () => void;
    setToken: (new_token: string) => void;
    setPlayerOnOrOff: (show: number) => void;
    setFirstTime: (n: boolean) => void;
    setTimer: (new_timer: Timer) => void;
    setLoading: (n: boolean) => void;
    setIsError: (n: boolean) => void;
    setUserInfo: (new_info: UserInfo) => void;
    setRepeatMode: (n: RepeatMode) => void;
    setShuffleMode: (n: boolean) => void; // deprecated
    setCategorys: (n: Category[]) => void;
    setCurrentPlayListID: (n: number | string) => void;
    setCurrentPlayList: (n: Track[]) => void;
    setSoundQualities: (n: SoundQualites) => void;
    setRateLinks: (n: RateLinks) => void;
    // shuffle list maintain
    setShuffleList: (n: (string | number)[]) => void;
    setLikeSongsList: (n: (string | number)[]) => void;
    setLikeAlbumsList: (n: (string | number)[]) => void;

    setSubIndex: (n: number) => void;
  };
};

type Timer = {
  current: number;
  duration: number;
  isStop: boolean;
  isRunning: boolean;
};

type UserInfo = {
  uid: string;
  nickname: string;
  email: string;
  is_member: number;
  google: null | string;
  facebook: null | string;
  apple: null | string;
  create_at: string;
  expiration_time: string;
  subscription_time: string;
  is_cancel_subscription: 0 | 1;
};

export type SoundQuality =
  | "standard"
  | "medium"
  | "normal"
  | "high"
  | "very_high";

type SoundQualites = {
  wifi_streaming: SoundQuality;
  data_streaming: SoundQuality;
};

export type RateLinks = {
  ios_download_url: string;
  android_download_url: string;
};
