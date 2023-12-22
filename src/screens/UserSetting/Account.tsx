import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { generalProperties } from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import CircularPacking from "../../components/CircularPacking";
import { data, data1 } from "../../example/data";
import Barplot from "../../components/Barplot";
import { useCommoneActions, useToken } from "../../store/user";
import {
  AccountStatisticsResponse,
  GenereStatisticsItem,
  SongStatisticsItem,
} from "../../types/response";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../../services/User.service";
import { Tree } from "../../types/example";

const width = Dimensions.get("screen").width - 48;
/**
 * Account Page
 * @param param0
 * @returns
 */
const Account = ({
  navigation,
  route,
}: RootStackScreenProps<"User.account">) => {
  const title_opacity = useRef(new Animated.Value(1)).current;
  const [opacityFlag, setOpacityFlag] = useState(true);
  const token = useToken();
  const regex = /(\d+)\s*(hr|h)?\s*(\d+)?\s*(min|minute|mins)?/;
  const [selected, setSelected] = useState<"Week" | "Month" | "Year">("Week"); // 0-week 1-month 2-year
  const setIsError = useCommoneActions().setIsError;
  const setIsLoading = useCommoneActions().setLoading;
  const [songData, setSongData] = useState<SongStatisticsItem[]>([]);
  const [genereData, setGenereData] = useState<GenereStatisticsItem[]>([]);

  const getAccountStaticsData = useQuery<AccountStatisticsResponse>({
    queryKey: ["account_data", selected],
    queryFn: () => UserService.getAccountStatistics(selected),
    enabled: !!token,
    cacheTime: 0,
  });

  const formatSongsData = useMemo(() => {
    let data: any[] = [];
    songData.map((item, i) => {
      data.push({
        x: item.key,
        value: item.value,
        tooltip: item.for_humans,
        interval: item.date,
      });
    });
    return data;
  }, [songData, selected]);

  const formatGenereData = useMemo(() => {
    let data: any = {
      type: "node",
      name: "sum",
      value: 0,
      children: [],
    };
    data.value = genereData.reduce((acc, curr) => acc + curr.count, 0);

    genereData.map((item, i) => {
      item.count > 0 &&
        data.children.push({
          type: "leaf",
          name: item.genre,
          value: item.count,
        });
    });

    return data;
  }, [selected, genereData]);

  useEffect(() => {
    if (getAccountStaticsData.isError) {
      setIsError(true);
    }
    if (getAccountStaticsData.isSuccess) {
      console.log(
        typeof getAccountStaticsData.data.total_duration === "string" &&
          getAccountStaticsData.data.total_duration.match(regex)
      );
      setGenereData([...getAccountStaticsData.data.genre]);
      setSongData([...getAccountStaticsData.data.song]);
    }
  }, [getAccountStaticsData.isSuccess, getAccountStaticsData.isError]);

  useEffect(() => {
    !!token && getAccountStaticsData.refetch();
  }, [selected, songData]);

  useEffect(() => {
    if (!opacityFlag) {
      Animated.timing(title_opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(title_opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [opacityFlag]);

  return (
    <View
      style={{
        ...globalState.container,
        paddingHorizontal: generalProperties.paddingX,
      }}
    >
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/account_page.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="ios-arrow-back-sharp" size={24} color="white" />
          <Text style={styles.header_text}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.push("User.settings")}>
          <Ionicons name="ios-settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {
        // time selector
      }
      <View style={styles.h}>
        <TouchableOpacity
          onPress={() => setSelected("Week")}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text
            style={{
              ...styles.h_t,
              color: selected === "Week" ? "#fff" : "rgba(212, 221, 224,0.6)",
            }}
          >
            Week
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            ...styles.h_t,
            color: selected === "Week" ? "#fff" : "rgba(212, 221, 224,0.6)",
          }}
        >
          {" "}
          /{" "}
        </Text>
        <TouchableOpacity
          onPress={() => setSelected("Month")}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text
            style={{
              ...styles.h_t,
              color: selected === "Month" ? "#fff" : "rgba(212, 221, 224,0.6)",
            }}
          >
            Month
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            ...styles.h_t,
            color: selected === "Month" ? "#fff" : "rgba(212, 221, 224,0.6)",
          }}
        >
          {" "}
          /{" "}
        </Text>
        <TouchableOpacity
          onPress={() => setSelected("Year")}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text
            style={{
              ...styles.h_t,
              color: selected === "Year" ? "#fff" : "rgba(212, 221, 224,0.6)",
            }}
          >
            Year
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {
          // bar chart
        }
        <>
          <Barplot
            width={width}
            height={width * 0.8}
            data={formatSongsData}
            setTitleOpacity={setOpacityFlag}
          />
          <Animated.View
            style={{ ...styles.flow_container, opacity: title_opacity }}
          >
            <Text style={{ ...styles.text, fontWeight: "bold", fontSize: 18 }}>
              Total Music Play
            </Text>
            {!getAccountStaticsData.isSuccess ||
            getAccountStaticsData.data.total_duration === 0 ? (
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ ...styles.text, fontWeight: "bold", fontSize: 18 }}
                >
                  -
                </Text>
                <Text style={{ ...styles.text, fontSize: 18 }}>mins</Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                {getAccountStaticsData.data.total_duration.match(regex)[2] ===
                  "hr" && (
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        ...styles.text,
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {
                        getAccountStaticsData.data.total_duration.match(
                          regex
                        )[1]
                      }
                    </Text>
                    <Text style={{ ...styles.text, fontSize: 18 }}> hr </Text>
                  </View>
                )}
                {(getAccountStaticsData.data.total_duration.match(regex)[
                  getAccountStaticsData.data.total_duration.match(regex)
                    .length - 1
                ] === "mins" ||
                  getAccountStaticsData.data.total_duration.match(regex)[
                    getAccountStaticsData.data.total_duration.match(regex)
                      .length - 1
                  ] === "min") && (
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        ...styles.text,
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {!!getAccountStaticsData.data.total_duration.match(regex)[
                        getAccountStaticsData.data.total_duration.match(regex)
                          .length - 2
                      ]
                        ? getAccountStaticsData.data.total_duration.match(
                            regex
                          )[
                            getAccountStaticsData.data.total_duration.match(
                              regex
                            ).length - 2
                          ]
                        : getAccountStaticsData.data.total_duration.match(
                            regex
                          )[1]}
                    </Text>
                    <Text style={{ ...styles.text, fontSize: 18 }}> mins</Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>
          {formatSongsData.filter((item) => item.value === 0).length ===
            formatSongsData.length && (
            <View style={{ position: "absolute", top: width / 3, left: "45%" }}>
              <Text style={{ ...styles.text, fontSize: 10 }}>No Records</Text>
            </View>
          )}
        </>
        {
          // desc title
        }
        <View style={{ marginTop: 32 }}>
          <Text style={styles.des_t}>Most Heard Category</Text>
          <Text style={{ ...styles.des_t, fontWeight: "bold" }}>
            {getAccountStaticsData.isSuccess &&
            getAccountStaticsData.data.most_category.length > 0
              ? getAccountStaticsData.data.most_category
              : "-"}
          </Text>
        </View>
        {
          // circular packing chart
        }

        {formatGenereData.value === 0 ? (
          <Image
            source={require("../../../assets/banner/empty_packing.png")}
            style={{
              resizeMode: "contain",
              width: "100%",
              height: width * 0.67,
            }}
          />
        ) : (
          <CircularPacking
            width={width}
            height={width}
            data={formatGenereData}
          />
        )}
        <View
          style={{
            width: "100%",
            marginBottom: generalProperties.tabPlayerHeight + 24,
          }}
        ></View>
      </ScrollView>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  header: {
    marginTop: generalProperties.marginTop,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  header_text: {
    fontSize: 24,
    fontFamily: "bold",
    marginLeft: 16,
    color: "#ffffff",
  },
  h: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 24,
    marginTop: 24,
    gap: 8,
  },
  h_t: {
    fontSize: 16,
    fontFamily: "regular",
    fontWeight: "400",
  },
  des_t: {
    color: "#fff",
    fontFamily: "regular",
    fontSize: 18,
  },
  flow_container: {
    position: "absolute",
    right: 0,
    alignItems: "flex-end",
    top: 0,
    zIndex: 100,
  },
  text: {
    fontFamily: "regular",
    color: "#fff",
  },
});
