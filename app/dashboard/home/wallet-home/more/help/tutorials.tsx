import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import YoutubePlayer from "react-native-youtube-iframe";

interface IProps {
  youtubeLink: string;
  title: string;
}

const items: IProps[] = [
  {
    youtubeLink: "s4_-SofCty4",
    title: "Swapping crypto to crypto",
  },
  {
    youtubeLink: "0_SujHiw690",
    title: "Swapping any crypto for naira using zap",
  },
  {
    youtubeLink: "1ae3dIsv4Bo",
    title: "Swapping your naira for crypto using zap",
  },
];

const ItemCards = ({ youtubeLink, title }: IProps) => {
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);
  return (
    <Box width={"100%"} mb="2xl">
      <Box
        height={220}
        borderRadius={12}
        bg="secondaryBackgroundColor"
        width={"100%"}
      >
        <YoutubePlayer
          height={"100%"}
          play={playing}
          videoId={youtubeLink} // Replace with the actual YouTube video ID
          onChangeState={onStateChange}
        />
      </Box>
      <CustomText variant="medium" fontSize={16} mt="s">
        {title}
      </CustomText>
    </Box>
  );
};

const Tutorials = () => {
  return (
    <PageWrapper>
      <SettingsHeader title="Tutorials" onBackPress={() => router.back()} />
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 150 }}>
          {items.map((item, index) => (
            <ItemCards key={index.toString()} {...item} />
          ))}
        </ScrollView>
      </Box>
    </PageWrapper>
  );
};

export default Tutorials;
