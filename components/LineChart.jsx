/* eslint-disable react/prop-types */
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useMemo } from "react";

const LineChart = ({ data, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const lineColor = "#3c55e2"; // Définir la couleur de la ligne ici
  const legendsColor = "#3c55e2"; // Définir la couleur de la légende ici

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !data[0]?.data) {
      return [];
    }
    return data.map(serie => ({ // This .map is the key!
      ...serie,
      color: lineColor,
      data: serie.data.map(point => ({
        ...point,
        y: parseFloat(point.y),
      })),
    }));
  }, [data, lineColor]);

  return (
    <ResponsiveLine
    data={data}
    theme={{
      axis: {
        domain: {
          line: {
            stroke: colors.gray[100],
          },
        },
        legend: {
          text: {
            fill: colors.gray[100],
          },
        },
        ticks: {
          line: {
            stroke: colors.gray[100],
            strokeWidth: 1,
          },
          text: {
            fill: colors.gray[100],
          },
        },
      },
      legends: {
        text: {
          fill: legendsColor,
        },
      },
      tooltip: {
        container: {
          color: legendsColor,
        },
      },
    }}
    colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 40, left: 50 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: -40,
        legend: isDashboard ? undefined : "Mois",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Montant Total (TND)",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;