import { TypedNavigator } from "@react-navigation/native";
import { NavigationState } from "@react-navigation/routers";
import { RootStackParamList } from "../types/global";
import Tab from "../screens/tabs";
import Player from "../screens/tabs/Player";

/**
 * tab navigator
 * @param Stack
 * @returns
 */
export default function (
  Stack: TypedNavigator<RootStackParamList, NavigationState, {}, any, any>
) {
  return (
    <Stack.Group screenOptions={{ animationEnabled: true, headerShown: false }}>
      <Stack.Screen options={{}} name="Index" component={Tab} />
      <Stack.Screen
        options={{ animation: "slide_from_bottom" }}
        name="Player"
        component={Player}
      />
    </Stack.Group>
  );
}
