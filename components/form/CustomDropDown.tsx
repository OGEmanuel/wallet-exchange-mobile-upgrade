import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import React from "react";
import { StyleSheet } from "react-native";
import CustomText from "../general/CustomText";
import Box from "../general/Box";

interface ICustomDropDownProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onSelected: (value: string) => void;
  placeHolder: string;
  label: string;
}

export default function CustomDropDown({
  options,
  value,
  onSelected,
  placeHolder,
  label,
}: ICustomDropDownProps) {
  const [isFocus, setIsFocused] = React.useState(false);

  return (
    <Box width={"100%"} height={"auto"}>
      <CustomText variant={"body"} marginBottom="s">
        {label}
      </CustomText>
      <Dropdown
        style={[
          Styles.dropdown,
          isFocus && { borderColor: "#2D66DD", borderWidth: 1 },
        ]}
        selectedTextStyle={{ color: "black" }}
        iconStyle={Styles.iconStyle}
        fontFamily="Inter_Regular"
        placeholder={placeHolder}
        placeholderStyle={{
          fontFamily: "Inter_Regular",
          fontSize: 14,
          color: "grey",
        }}
        data={options}
        maxHeight={200}
        labelField="label"
        valueField="value"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(item) => {
          onSelected(item.value);
        }}
        renderRightIcon={() => (
          <Ionicons
            style={Styles.icon}
            color={isFocus ? "blue" : "black"}
            name={isFocus ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
          />
        )}
      />
    </Box>
  );
}

const Styles = StyleSheet.create({
  martContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  subContainer: {
    height: "90%",
    width: "95%",
  },

  flex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 100,
    height: 50,
  },

  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: 50, // Adjust width based on your design
    textAlign: "center",
  },
  containerS: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  image: {
    width: "90%",
    height: "80%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  slideContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  image1: {
    width: "95%",
    height: "55%",
    resizeMode: "cover",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  content: {
    width: "95%",
    height: "45%",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#667085",
  },
  sidebar: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 999,
  },
  propDtls: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // dropdown container
  selectCont: {
    // backgroundColor: 'white',
    paddingTop: 40,
  },
  dropdown: {
    height: 42,
    borderColor: "lightgrey",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontFamily: "Inter_Regular",
    backgroundColor: "white",
  },
  icon: {
    marginRight: 5,
    color: "grey",
  },
  label: {
    position: "absolute",
    // backgroundColor: 'red',
    left: 0,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: "BasierRegular",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
