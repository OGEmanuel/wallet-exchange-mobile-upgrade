import { Pressable, StyleSheet, Text } from "react-native";

const CustomLink = (props: { label: string; onPress: () => void }) => {
  const { label, onPress } = props;

  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

export default CustomLink;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#6045FF",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 32,
    marginTop: 24,
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});
