export const chartConfig = {
  backgroundGradientFrom: "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "transparent",
  backgroundGradientToOpacity: 0,
  backgroundColor: "transparent",
  fillShadowGradientFromOpacity: 0,
  fillShadowGradientToOpacity: 0,
  decimalPlaces: 0,
  color: (opacity = 1) => `#10B981`, // Green color for positive changes
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray labels
  style: {
    borderRadius: 16,
  },
  propsForBackgroundLines: {
    strokeWidth: 0.5,
    strokeDasharray: "2,2",
    stroke: "rgba(107, 114, 128, 0.2)",
  },
  propsForDots: {
    r: "0",
  },
  strokeWidth: 2, // Make the line thicker
};
