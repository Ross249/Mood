import { StyleSheet, View } from "react-native";
import React from "react";
import { CircularPackingProps } from "../types/component";
import * as d3 from "d3";
import { Tree } from "../types/example";
import Svg, { Circle, Text } from "react-native-svg";

const CircularPacking = ({ width, height, data }: CircularPackingProps) => {
  const hierarchy = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value! - a.value!);

  const packGenerator = d3.pack<Tree>().size([width, height]).padding(5);
  const root = packGenerator(hierarchy);

  return (
    <Svg width={width} height={height} style={{}}>
      {root
        .descendants()
        .slice(1)
        .map((node) => {
          return (
            <Circle
              key={node.data.name}
              cx={node.x}
              cy={node.y}
              r={node.r}
              // stroke="#553C9A"
              stroke="white"
              strokeWidth={1}
              // fill="#B794F4"
              fill="rgba(0,0,0,0)"
              fillOpacity={1}
            />
          );
        })}
      {root
        .descendants()
        .slice(1)
        .map((node, i) => (
          <Text
            key={node.data.name}
            x={node.x}
            y={node.y}
            fontSize={18 - i * 1.5}
            textAnchor="middle"
            stroke={"rgba(0,0,0,0.1)"}
            alignmentBaseline="middle"
            fill={"#fff"}
            fontFamily="regular"
          >
            {node.data.name}
          </Text>
        ))}
    </Svg>
  );
};

export default CircularPacking;

const styles = StyleSheet.create({});
