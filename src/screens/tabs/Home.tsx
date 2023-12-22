import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { RootTabScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import {
  adUnitId,
  generalProperties,
  homepageImage,
} from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import Banner from "../../components/Banner";
import { songsList } from "../../example/songs";
import HorizonList from "../../components/HorizonList";
import RoundedCategory from "../../components/RoundedCategory";
import ShareCard from "../../components/ShareCard";
import Intro from "../../components/Intro";
import {
  useCommoneActions,
  useIsFirstTime,
  useToken,
  useUserInfo,
} from "../../store/user";
import {
  Category,
  IndexPageResponseData,
  PlayList,
  Song,
} from "../../types/response";
import { useQuery } from "@tanstack/react-query";
import { HomeService } from "../../services/Home.serveice";
import {
  BannerAd,
  BannerAdSize,
  useInterstitialAd,
  useRewardedInterstitialAd,
} from "react-native-google-mobile-ads";
import { RateLinks } from "../../types/common";
import { usePlaybackState, useProgress } from "react-native-track-player";

/**
 * home page
 * @param param0
 * @returns
 */
const Home = ({ navigation, route }: RootTabScreenProps<"Home">) => {
  const token = useToken();
  const isFirst = useIsFirstTime();
  const setIsFirst = useCommoneActions().setFirstTime;
  const setIsError = useCommoneActions().setIsError;
  const setIsLoading = useCommoneActions().setLoading;
  const setRateLinks = useCommoneActions().setRateLinks;
  const playbackState = usePlaybackState();
  const userInfo = useUserInfo();

  const [newList, setNewList] = useState<Song[]>([]);
  const [mplList, setMplList] = useState<Song[]>([]);
  const [hour1List, setHour1List] = useState<PlayList[]>([]);
  const [hour2List, setHour2List] = useState<PlayList[]>([]);
  const [hour4List, setHour4List] = useState<PlayList[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const getHomePage = useQuery<IndexPageResponseData>({
    queryKey: ["home_page"],
    queryFn: HomeService.getHomePage,
  });

  const getRateLinks = useQuery<RateLinks>({
    queryKey: ["rate_links"],
    queryFn: HomeService.getRateLinks,
  });

  useEffect(() => {
    if (getHomePage.isSuccess) {
      setIsLoading(false);
      setNewList([...getHomePage.data.new]);
      setMplList([...getHomePage.data.most_people_listen]);
      setHour1List([...getHomePage.data.one_hour_lofi]);
      setHour2List([...getHomePage.data.two_hour_lofi]);
      setHour4List([...getHomePage.data.four_hour_lofi]);
      setCategoryList([...getHomePage.data.categories]);
    }
    if (getHomePage.isError) {
      setIsLoading(false);
      setIsError(true);
    }
    if (getHomePage.isFetching) {
      setIsLoading(true);
    }
  }, [getHomePage.isSuccess, getHomePage.isError, getHomePage.isFetching]);

  useEffect(() => {
    if (getRateLinks.isSuccess) {
      setRateLinks({ ...getRateLinks.data });
    }
  }, [getRateLinks.isSuccess]);

  useEffect(() => {
    console.log(token);
    console.log(userInfo);
    console.log(playbackState.state);
  }, []);

  return (
    <View style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/home_page.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scroll_c}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={getHomePage.isFetching}
            onRefresh={() => getHomePage.refetch()}
          />
        }
      >
        <View style={styles.header}>
          <Image
            source={require("../../../assets/banner/mood.png")}
            style={{ width: 80, height: 28, resizeMode: "contain" }}
          />
          <TouchableOpacity
            onPress={() => {
              !!token
                ? navigation.push("User.account")
                : navigation.push("Auth.signin");
            }}
          >
            <Image
              source={require("../../../assets/icons/person.png")}
              style={{ width: 28, height: 28 }}
            />
          </TouchableOpacity>
        </View>
        {
          // banner for newer
        }
        {userInfo.is_member === 0 && <Banner navigation={navigation} />}

        {
          //new
        }
        <HorizonList
          type="new"
          tag="recommend"
          data={newList}
          navigation={navigation}
        />
        <HorizonList
          type="most"
          tag="recommend"
          data={mplList}
          navigation={navigation}
        />
        {userInfo.is_member === 0 && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
              keywords: ["fashion", "clothing"],
            }}
          />
        )}
        <HorizonList
          type="hour1"
          tag="hour"
          data={hour1List}
          navigation={navigation}
        />
        <HorizonList
          type="hour2"
          tag="hour"
          data={hour2List}
          navigation={navigation}
        />
        {userInfo.is_member === 0 && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
              keywords: ["fashion", "clothing"],
            }}
          />
        )}
        <HorizonList
          type="hour4"
          tag="hour"
          data={hour4List}
          navigation={navigation}
        />

        {
          // category
        }
        <View style={{ width: "100%", marginTop: 20 }}>
          <View style={styles.h_header}>
            <Text
              style={{
                color: "white",
                fontSize: 40,
                fontFamily: "dotty",
                letterSpacing: -1.2,
              }}
            >
              Category
            </Text>
          </View>

          <ScrollView
            style={{
              width: "100%",
              paddingHorizontal: 24,
              marginTop: 20,
            }}
            contentContainerStyle={{
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {categoryList.map((item, index) => (
              <RoundedCategory
                key={item.id}
                image={item.cover}
                index={index}
                title={item.name}
                press={() => navigation.navigate("Explore", { id: item.id })}
              />
            ))}
          </ScrollView>
        </View>

        {
          // share card
        }
        <ShareCard />
        {userInfo.is_member === 0 && (
          <View
            style={{
              paddingBottom: [
                undefined,
                "playing",
                "paused",
                "loading",
                "ready",
                "buffering",
              ].includes(playbackState.state)
                ? generalProperties.tabPlayerHeight
                : 0,
            }}
          >
            <View
              style={{
                marginBottom: 32,
              }}
            >
              <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  scroll_c: {
    alignItems: "center",
  },
  scroll: {
    width: "100%",
    marginTop: 64,
    // marginBottom: generalProperties.tabPlayerHeight
    //  + generalProperties.tabHeight ,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: generalProperties.paddingX,
  },

  h_header: {
    paddingHorizontal: generalProperties.paddingX,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});
