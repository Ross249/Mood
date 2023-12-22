import { create } from "zustand";
import { Store } from "../types/common";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { RepeatMode } from "react-native-track-player";

export const useCommonStore = create<Store>()(
  persist(
    (set) => ({
      token: "",
      showPlayer: 0,
      firstTime: true,
      timer: {
        current: 0,
        duration: 30,
        isRunning: false,
        isStop: false,
      },
      is_error: false,
      loading: false,
      userInfo: {
        uid: "",
        nickname: "",
        email: "",
        is_member: 0,
        google: null,
        facebook: null,
        apple: null,
        create_at: "",
        subscription_time: "",
        expiration_time: "",
        is_cancel_subscription: 0,
      },
      shuffleMode: false,
      repeatMode: RepeatMode.Off,
      categorys: [],
      currentPlayListID: 0,
      currentPlayList: [],
      soundQualities: {
        wifi_streaming: "standard",
        data_streaming: "standard",
      },
      rateLinks: {
        ios_download_url: "",
        android_download_url: "",
      },
      shuffleLists: [],
      likeAlbumsList: [],
      likeSongsList: [],
      subIndex: 0,
      actions: {
        logout: () => {
          set((state) => ({
            ...state,
            token: "",
            userInfo: {
              uid: "",
              nickname: "",
              email: "",
              is_member: 0,
              google: null,
              facebook: null,
              apple: null,
              create_at: "",
              subscription_time: "",
              expiration_time: "",
              is_cancel_subscription: 0,
            },
            soundQualities: {
              wifi_streaming: "standard",
              data_streaming: "standard",
            },
            // firstTime: true,
          }));
        },
        setToken: (token?: string) => {
          AppToken = token ?? null;
          set((state) => ({ ...state, token: token }));
        },
        setPlayerOnOrOff: (show) => {
          set((state) => ({ ...state, showPlayer: show }));
        },
        setFirstTime: (n) => {
          set((state) => ({ ...state, firstTime: n }));
        },
        setTimer: (new_timer) => {
          set((state) => ({ ...state, timer: new_timer }));
        },
        setLoading: (n) => {
          set((state) => ({ ...state, loading: n }));
        },
        setIsError: (n) => {
          set((state) => ({ ...state, is_error: n }));
        },
        setUserInfo: (new_info) => {
          set((state) => ({ ...state, userInfo: new_info }));
        },
        setRepeatMode: (new_mode) => {
          set((state) => ({ ...state, repeatMode: new_mode }));
        },
        setShuffleMode: (new_mode) => {
          set((state) => ({ ...state, shuffleMode: new_mode }));
        },
        setCategorys: (new_categorys) => {
          set((state) => ({ ...state, categorys: new_categorys }));
        },
        setCurrentPlayListID: (id) => {
          set((state) => ({ ...state, currentPlayListID: id }));
        },
        setCurrentPlayList: (new_playlist) => {
          set((state) => ({ ...state, currentPlayList: new_playlist }));
        },
        setSoundQualities: (new_quality_config) => {
          set((state) => ({ ...state, soundQualities: new_quality_config }));
        },
        setRateLinks: (new_rate_links) => {
          set((state) => ({ ...state, rateLinks: new_rate_links }));
        },

        // maintain shuffle lists
        setShuffleList: (n) => {
          set((state) => ({
            ...state,
            shuffleLists: n,
          }));
        },
        setLikeAlbumsList: (n) => {
          set((state) => ({
            ...state,
            likeAlbumsList: n,
          }));
        },
        setLikeSongsList: (n) => {
          set((state) => ({
            ...state,
            likeSongsList: n,
          }));
        },

        setSubIndex: (n) => {
          set((state) => ({
            ...state,
            subIndex: n,
          }));
        },
      },
    }),
    {
      storage: createJSONStorage(() => AsyncStorage),
      name: Constants.expoConfig?.name ?? "mood",
      partialize: (state) => {
        return {
          token: state.token,
          firstTime: state.firstTime,
          userInfo: state.userInfo,
          shuffleMode: state.shuffleMode,
          repeatMode: state.repeatMode,
          categorys: state.categorys,
          currentPlayListID: state.currentPlayListID,
          currentPlayList: state.currentPlayList,
          soundQualities: state.soundQualities,
          rateLinks: state.rateLinks,
          likeSongsList: state.likeSongsList,
          likeAlbumsList: state.likeAlbumsList,
        };
      },
    }
  )
);

export const useCommoneActions = () => useCommonStore((state) => state.actions);
export const useToken = () => useCommonStore((state) => state.token);
export const usePlayerState = () => useCommonStore((state) => state.showPlayer);
export const useIsFirstTime = () => useCommonStore((state) => state.firstTime);
export const useTimer = () => useCommonStore((state) => state.timer);
export const useUserInfo = () => useCommonStore((state) => state.userInfo);
export const useLoading = () => useCommonStore((state) => state.loading);
export const useIsError = () => useCommonStore((state) => state.is_error);
export const useShuffleList = () =>
  useCommonStore((state) => state.shuffleLists);
export const useRepeatMode = () => useCommonStore((state) => state.repeatMode);
export const useQualities = () =>
  useCommonStore((state) => state.soundQualities);
export const useCategorys = () => useCommonStore((state) => state.categorys);
export const useCurrentPlayList = () =>
  useCommonStore((state) => state.currentPlayList);
export const useCurrentPlayListID = () =>
  useCommonStore((state) => state.currentPlayListID);
export const useShuffleMode = () =>
  useCommonStore((state) => state.shuffleMode);

export const useRateLinks = () => useCommonStore((state) => state.rateLinks);
export const useLikeSongs = () =>
  useCommonStore((state) => state.likeSongsList);
export const useLikeAlbums = () =>
  useCommonStore((state) => state.likeAlbumsList);

export const useSubIndex = () => useCommonStore((state) => state.subIndex);
