import { TypedNavigator } from "@react-navigation/native";
import { NavigationState } from "@react-navigation/routers";
import { RootStackParamList } from "../types/global";
import Album from "../screens/Home/Album";
import Timer from "../screens/Home/Timer";

/**
 * album navigator
 * @param Stack
 * @returns
 */
export default function (
  Stack: TypedNavigator<RootStackParamList, NavigationState, {}, any, any>
) {
  return (
    <Stack.Group screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen
        name="Album"
        component={Album}
        options={{ headerShown: false, animation: "slide_from_right" }}
      /> */}
      <Stack.Screen
        name="Timer"
        component={Timer}
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
    </Stack.Group>
  );
}
