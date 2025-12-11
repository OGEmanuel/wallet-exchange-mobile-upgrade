import { StyleSheet, Text } from "react-native";

const HeaderText = (props: { children: string }) => {
  const { children } = props;
  return <Text style={styles.header}>{children}</Text>;
};

export default HeaderText;

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: 600,
    color: "#FFFFFF",
  },
});
