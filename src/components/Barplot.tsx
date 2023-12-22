import { Image, StyleSheet, View, Platform, Dimensions } from "react-native";
import React, { useMemo, useRef, useEffect, useState } from "react";
import { BarplotProps } from "../types/component";
import { Svg, Rect, G, Line, Text, ForeignObject } from "react-native-svg";
import {
  ScaleBand,
  ScaleLinear,
  axisBottom,
  axisLeft,
  scaleBand,
  scaleLinear,
  select,
} from "d3";
import { generalProperties } from "../common/constant";
import TooltipText from "./TooltipText";

const sc = Dimensions.get("screen").width;
interface AxisBottomProps {
  scale: ScaleBand<string> | any;
  x: number;
  y: number;
}

interface AxisLeftProps {
  scale: ScaleLinear<number, number>;
  x: number;
  y: number;
}
interface BarsProps {
  data: { x: string; value: number; tooltip: string; interval: string[] }[];
  height: number;
  scaleX:
    | ScaleBand<string>
    | ScaleBand<string>["copy"]
    | ScaleLinear<number, number>
    | any;

  scaleY: ScaleLinear<number, number>;
  select: string;
  press: (n: string) => void;
  setTitleOpacity: (n: boolean) => void;
}

interface TooltipProps {
  x: number;
  y: number;
  value: number;
  total_time: string;
  time_interval: string[];
}

function AxisBottom({ scale, x, y }: AxisBottomProps) {
  return (
    <G transform={`translate(${x}, ${y})`}>
      {scale.domain().map((tick: string, index: number) => (
        <G
          key={`tick-${tick}-${index}`}
          transform={`translate(${scale(tick) + scale.bandwidth() / 2}, 0)`}
          opacity={scale.domain().length === 12 ? (index % 2 === 0 ? 1 : 0) : 1}
        >
          <Line y2={6} stroke="black" />
          <Text
            y={15}
            fontSize={12}
            textAnchor="middle"
            fill={"#fff"}
            fontFamily="regular"
          >
            {tick}
          </Text>
        </G>
      ))}
      <Line
        x1={-x}
        x2={scale.range()[1]}
        y1={1}
        y2={1}
        stroke={"#fff"}
        strokeWidth={0.5}
      />
    </G>
  );
}

function AxisLeft({ scale, x, y }: AxisLeftProps) {
  return (
    <G transform={`translate(${x}, ${y - 10})`}>
      {scale.ticks(8).map((tick, index) => (
        <G
          key={`tick-${tick}-${index}`}
          transform={`translate(0, ${scale(tick)})`}
        >
          {/* <Line x2={-6} stroke="#fff" fill={"#fff"} /> */}
          <Text
            x={-8}
            y={y - 5}
            fontSize={12}
            textAnchor="end"
            fill={"#fff"}
            fontFamily="regular"
          >
            {tick}
          </Text>
        </G>
      ))}
      <Line
        x1={0}
        x2={0}
        y1={0}
        y2={scale.range()[0]}
        stroke={"#fff"}
        strokeWidth={0.5}
      />
    </G>
  );
}

function Bars({
  data,
  height,
  scaleX,
  scaleY,
  press,
  select,
  setTitleOpacity,
}: BarsProps) {
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  useEffect(() => {
    setTitleOpacity(true);
    press("0");
  }, [data]);

  return (
    <G>
      {data.map(
        (d, index) =>
          d.value > 0 && (
            <Rect
              key={`bar-${d.x}`}
              x={scaleX(d.x) + scaleX.bandwidth() / 4}
              y={scaleY(d.value) + 1}
              width={scaleX.bandwidth() / 2}
              height={height - scaleY(d.value)}
              fill={generalProperties.primary}
              onPress={() => {
                setTooltip({
                  x: scaleX(d.x) + scaleX.bandwidth() / 2,
                  y: scaleY(d.value) + generalProperties.tooltip_line_offset,
                  value: d.value,
                  time_interval: d.interval,
                  total_time: d.tooltip as string,
                });
                if (
                  scaleX(d.x) + scaleX.bandwidth() / 2 > sc - 190 &&
                  scaleY(d.value) + generalProperties.tooltip_line_offset < 44
                ) {
                  setTitleOpacity(false);
                }

                press("x" + d.x);
              }}
            />
          )
      )}
      {data.map(
        (d, index) =>
          d.value > 0 && (
            <G opacity={select === "x" + d.x ? 1 : 0}>
              <Line
                x1={scaleX(d.x) + scaleX.bandwidth() / 2}
                y1={
                  scaleY(d.value) -
                  generalProperties.tooltip_line_offset -
                  generalProperties.tooltip_line_height
                }
                x2={scaleX(d.x) + scaleX.bandwidth() / 2}
                y2={
                  scaleY(d.value) - generalProperties.tooltip_line_offset <
                  generalProperties.tooltip_height
                    ? scaleY(d.value) -
                      generalProperties.tooltip_line_offset -
                      generalProperties.tooltip_line_height
                    : scaleY(d.value)
                }
                stroke="#fff"
              />
              <Rect
                x={
                  scaleX(d.x) + scaleX.bandwidth() / 2 > 150
                    ? scaleX(d.x) +
                      scaleX.bandwidth() / 2 -
                      generalProperties.tooltip_width
                    : scaleX(d.x) + scaleX.bandwidth() / 2
                }
                y={
                  scaleY(d.value) - generalProperties.tooltip_line_offset <
                  generalProperties.tooltip_height
                    ? scaleY(d.value) -
                      generalProperties.tooltip_line_offset +
                      generalProperties.tooltip_height / 2
                    : scaleY(d.value) -
                      generalProperties.tooltip_line_offset * 1.8 -
                      generalProperties.tooltip_height / 2 -
                      generalProperties.tooltip_line_height
                }
                width={generalProperties.tooltip_width}
                height={
                  d.tooltip.length > 10
                    ? generalProperties.tooltip_height
                    : generalProperties.tooltip_height - 10
                }
                fill="rgba(19,19,19,0.6)"
                stroke={"#fff"}
                strokeWidth={1}
                rx={2}
                ry={2}
              />
              <G>
                <ForeignObject
                  x={
                    scaleX(d.x) + scaleX.bandwidth() / 2 > 150
                      ? scaleX(d.x) +
                        scaleX.bandwidth() / 2 -
                        generalProperties.tooltip_width
                      : scaleX(d.x) + scaleX.bandwidth() / 2
                  }
                  // x={tooltip.x -144}
                  y={
                    scaleY(d.value) - generalProperties.tooltip_line_offset <
                    generalProperties.tooltip_height
                      ? scaleY(d.value) -
                        generalProperties.tooltip_line_offset +
                        generalProperties.tooltip_height / 2
                      : scaleY(d.value) -
                        generalProperties.tooltip_line_offset -
                        generalProperties.tooltip_line_offset -
                        generalProperties.tooltip_height / 2 -
                        generalProperties.tooltip_line_height
                  }
                  width={generalProperties.tooltip_width}
                  height={
                    d.tooltip.length > 10
                      ? generalProperties.tooltip_height
                      : generalProperties.tooltip_height - 10
                  }
                  key={"tooltip_text"}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0)",
                      width: generalProperties.tooltip_width,
                      height: generalProperties.tooltip_height,
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1, width: "100%", padding: 8 }}>
                      <TooltipText
                        content={`Date: ${
                          d.interval.length === 1
                            ? d.interval[0]
                            : d.interval[0] + " - " + d.interval[1]
                        }`}
                        TextStyle={{
                          fontWeight: "bold",
                          opacity: select === "x" + d.x ? 1 : 0,
                        }}
                      />
                      <TooltipText
                        TextStyle={{ opacity: select === "x" + d.x ? 1 : 0 }}
                        content={`Total time spend: ${d.tooltip}`}
                      />
                    </View>
                  </View>
                </ForeignObject>
              </G>
            </G>
          )
      )}
    </G>
  );
}

const Barplot = ({ width, height, data, setTitleOpacity }: BarplotProps) => {
  const margin = { top: 10, right: 0, bottom: 18, left: 30 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const [select, setSelect] = useState("0"); // 0-unshow others-show

  let scaleX = useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.x))
      .range([0, w])
      .padding(0.5);
  }, [data]);

  let scaleY = useMemo(() => {
    return scaleLinear()
      .domain([
        0,
        Math.max(...data.map((d) => d.value)) > 70
          ? Math.max(...data.map((d) => d.value)) > 140
            ? Math.max(...data.map((d) => d.value))
            : 140
          : 70,
      ])
      .range([h, 0]);
  }, [data]);

  return (
    <>
      <Svg
        width={width}
        height={height}
        fill={"red"}
        onPress={() => {
          setTitleOpacity(true);
          setSelect("0");
        }}
      >
        <G transform={`translate(${margin.left},${margin.top})`}>
          <AxisBottom scale={scaleX} x={0} y={h} />
          <AxisLeft scale={scaleY} x={0} y={10} />
          <Bars
            data={data}
            height={h}
            scaleX={scaleX}
            scaleY={scaleY}
            press={setSelect}
            select={select}
            setTitleOpacity={setTitleOpacity}
          />
        </G>
      </Svg>
    </>
  );
};

export default Barplot;

const styles = StyleSheet.create({});
