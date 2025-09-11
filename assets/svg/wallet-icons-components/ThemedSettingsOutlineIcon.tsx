import React from "react";
import { useColorScheme } from "react-native";
import { SvgXml } from "react-native-svg";

interface ThemedSettingsOutlineIconProps {
  width?: number;
  height?: number;
  style?: any;
  lightModeColor?: string;
  darkModeColor?: string;
}

const ThemedSettingsOutlineIcon: React.FC<ThemedSettingsOutlineIconProps> = ({
  width = 24,
  height = 24,
  style,
  lightModeColor = "#121212",
  darkModeColor = "#FFFFFF",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const strokeColor = isDark ? darkModeColor : lightModeColor;
  const fillColor = isDark ? darkModeColor : lightModeColor;

  const svgContent = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <path
    d="M20.35 8.923L19.984 8.719c-.322-.166-.593-.416-.784-.724-.016-.027-.032-.056-.064-.112a1.87 1.87 0 0 1-.3-1.157l.006-.425c.012-.68.018-1.022-.078-1.328a2.07 2.07 0 0 0-.417-.736c-.214-.24-.511-.412-1.106-.754l-.494-.285c-.592-.341-.889-.512-1.204-.577a1.83 1.83 0 0 0-.843.007c-.313.07-.606.246-1.191.596l-.003.002-.354.211c-.056.034-.085.05-.113.066a1.87 1.87 0 0 1-1.041.25h-.13a1.87 1.87 0 0 1-1.039-.252l-.357-.214c-.589-.354-.884-.53-1.199-.601a1.83 1.83 0 0 0-.846.007c-.316.066-.612.238-1.205.582l-.487.283c-.588.34-.883.512-1.095.751a2.07 2.07 0 0 0-.415.734c-.095.307-.09.649-.078 1.333l.007.424c0 .065.003.097.002.128a1.87 1.87 0 0 1-.301 1.027c-.033.056-.048.084-.065.11-.169.272-.4.5-.675.664l-.112.063-.361.2c-.602.333-.903.5-1.121.738a2.06 2.06 0 0 0-.43.73c-.1.307-.1.65-.099 1.338l.002.563c.001.683.003 1.024.104 1.33.089.269.235.516.427.725.218.236.516.403 1.113.735l.358.199c.061.034.092.05.121.067.313.188.569.458.74.782l.067.12a1.86 1.86 0 0 1 .23 1.038l-.007.407c-.012.686-.017 1.03.078 1.337.085.272.227.523.417.736.214.24.511.411 1.105.754l.494.285c.593.341.889.512 1.204.577a1.83 1.83 0 0 0 .843-.007c.313-.07.606-.246 1.191-.596l.354-.211c.304-.196.657-.306 1.02-.317h.26c.318.01.63.097.91.252l.092.055.376.226c.59.354.884.53 1.199.601a1.83 1.83 0 0 0 .846-.007c.316-.066.612-.238 1.205-.582l.495-.286c.588-.34.883-.512 1.095-.751.19-.213.331-.464.416-.735.095-.305.09-.645.078-1.319l-.008-.44a1.87 1.87 0 0 1 .3-1.155l.065-.11c.168-.273.4-.5.674-.664l.111-.061.362-.201c.602-.334.903-.5 1.121-.738.194-.21.34-.46.43-.73.1-.305.1-.647.099-1.327l-.002-.574c-.001-.683-.002-1.025-.103-1.33a2.07 2.07 0 0 0-.429-.725c-.217-.236-.516-.402-1.112-.734z"
    stroke="${strokeColor}"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8.376 8.376A5.125 5.125 0 0 1 12 6.875a5.125 5.125 0 1 1-3.624 1.501zM12 9.125a2.875 2.875 0 1 0 0 5.75 2.875 2.875 0 0 0 0-5.75z"
    fill="${fillColor}"
  />
</svg>`;

  return (
    <SvgXml xml={svgContent} width={width} height={height} style={style} />
  );
};

export default ThemedSettingsOutlineIcon;
