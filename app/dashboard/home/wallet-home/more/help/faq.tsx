import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { FAQModel } from "@/src/modules/settings/domain/entities/models/faq-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Minus } from "iconsax-react-nativejs";
import { Plus } from "lucide-react-native";
import React from "react";
import { ActivityIndicator } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";

const ItemCard = ({ item }: { item: FAQModel }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const theme = useTheme<Theme>();
  return (
    <Box
      width={"100%"}
      height={isOpen ? "auto" : 41}
      borderRadius={12}
      bg="secondaryBackgroundColor"
      overflow="hidden"
      marginBottom="m"
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={41}
        width={"100%"}
        paddingHorizontal="m"
      >
        <CustomText>{item?.question}</CustomText>
        {isOpen && (
          <Minus
            variant="Outline"
            size={25}
            color={theme.colors.bodyTextColor}
            onPress={() => setIsOpen(!isOpen)}
          />
        )}
        {!isOpen && (
          <Plus
            size={25}
            color={theme.colors.bodyTextColor}
            onPress={() => setIsOpen(!isOpen)}
          />
        )}
      </Box>
      {isOpen && (
        <Box minHeight={100} maxHeight={200} p="m">
          <ScrollView showsVerticalScrollIndicator={false}>
            {item?.answer?.map((item, index) => (
              <CustomText key={index.toString()} variant="body" mb="s">
                {item}
              </CustomText>
            ))}
          </ScrollView>
        </Box>
      )}
    </Box>
  );
};

const Faq = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<FAQModel[]>([]);
  const theme = useTheme<Theme>();
  const { getFaq } = useSettings();

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getFaq();
        setIsLoading(false);
        setData(response?.data || []);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    })();
  }, []);

  return (
    <PageWrapper>
      <SettingsHeader title="FAQ" onBackPress={() => router.back()} />
      <Box pt="m" paddingHorizontal="m">
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemCard item={item} />}
          ListFooterComponent={() => (
            <Box
              width={"100%"}
              height={20}
              justifyContent="center"
              alignItems="center"
            >
              <ActivityIndicator
                color={theme.colors.primaryColor}
                animating={isLoading}
              />
            </Box>
          )}
          ListEmptyComponent={() => (
            <>
              {!isLoading && data?.length < 1 && (
                <Box
                  width={"100%"}
                  height={20}
                  justifyContent="center"
                  alignItems="center"
                >
                  <CustomText variant="body" color="bodyTextColor">
                    No FAQs found
                  </CustomText>
                </Box>
              )}
            </>
          )}
        />
      </Box>
    </PageWrapper>
  );
};

export default Faq;
