import { Pressable, StyleSheet, Text } from "react-native";

const SkipButton = (props: { onSkip: () => void }) => {
  const { onSkip } = props;

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Pressable style={styles.skipButton} onPress={handleSkip}>
      <Text style={styles.skipText}>Skip</Text>
    </Pressable>
  );
};

export default SkipButton;

const styles = StyleSheet.create({
  skipButton: {
    marginTop: 16,
    paddingVertical: 20,
  },
  skipText: {
    color: "white",
    alignSelf: "center",
  },
});
