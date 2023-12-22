import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import colors from "../common/colors";
import { SvgLinearGradientProps } from "../types/component";

/**
 * Album image background
 * @param param0
 * @returns
 */
const SvgLinearGradient = ({
  fill,
  height,
  end_color,
}: SvgLinearGradientProps) => {
  return (
    <Svg height={height} width="100%">
      <Defs>
        <LinearGradient id="grad" x1="50%" y1="100%" x2="50%" y2="0%">
          <Stop
            offset="0%"
            stopColor={!!end_color ? end_color : colors.blackBg}
            stopOpacity="1"
          />
          <Stop
            offset="5%"
            stopColor={!!end_color ? end_color : colors.blackBg}
            stopOpacity="1"
          />
          <Stop offset="100%" stopColor={fill} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  );
};

export default SvgLinearGradient;

const styles = StyleSheet.create({});
