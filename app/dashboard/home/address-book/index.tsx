import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import React from "react";
import { ActivityIndicator } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

const EmptyState = () => {
  return (
    <Box width={"100%"} flex={1} alignItems="center" justifyContent="center">
      <Image
        source={require("@/assets/images/addressbook.png")}
        style={{ width: 250, height: 250 }}
        contentFit="contain"
      />
      <CustomText variant="subheader">No Contacts</CustomText>
      <CustomText textAlign="center" style={{ width: "70%" }} mt="m">
        You need to add your addresses to view a list of addresses here
      </CustomText>
      <Box height={30} />
      <CustomButton
        width={"70%"}
        text="Add address"
        onPress={() => router.push("/dashboard/home/address-book/add-address")}
        borderRadius={50}
      />
    </Box>
  );
};

const ItemCard = () => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width="100%"
      height={90}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          width={60}
          height={60}
          bg="secondaryBackgroundColor"
          borderRadius={12}
        ></Box>
        <Box marginLeft="s">
          <CustomText>MoonBag</CustomText>
          <CustomText mt="s">0xd5321...de32</CustomText>
        </Box>
      </Box>
      {/* <ChevronRight /> */}
      <MoreVertical size={25} color={theme.colors.bodyTextColor} />
    </Box>
  );
};

const Addresses = () => {
  // states
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [data, setData] = React.useState([]);

  const theme = useTheme<Theme>();
  const user = useSelector(selectUser);
  const { getUserAddress } = useSettings();

  React.useEffect(() => {
    (async () => {
      try {
        setAddressLoading(true);
        const response = await getUserAddress(user?._id as string);
        console.log("This is the data", response.data);
        // to avoid duplicates
        setData([...data, ...(response.data as any)] as []);
        setAddressLoading(false);
      } catch (error) {
        console.log(error);
        alert("An error occured");
      }
    })();
  }, []);
  return (
    <PageWrapper>
      <AppBar
        height={20}
        title={<CustomText variant="bodySubheader">Address book</CustomText>}
        leading={
          <ChevronLeft
            size={25}
            color={theme.colors.bodyTextColor}
            onPress={() => router.back()}
          />
        }
      />
      <Box flex={1} bg="mainBackgroundColor">
        <FlatList
          ListEmptyComponent={() => (
            <>
              {!addressLoading && (
                <Box flex={1} mt="5xl" justifyContent="center">
                  <EmptyState />
                </Box>
              )}
            </>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ItemCard />}
          ListFooterComponent={() => (
            <>
              {addressLoading && (
                <Box
                  width={"100%"}
                  height={100}
                  justifyContent="center"
                  alignItems="center"
                >
                  <ActivityIndicator
                    color={theme.colors.primaryColor}
                    size={"small"}
                  />
                </Box>
              )}
            </>
          )}
        />
      </Box>
      <Box
        width={"100%"}
        height={60}
        justifyContent="center"
        alignItems="center"
      >
        {!addressLoading && data.length > 0 && (
          <CustomButton
            width={"70%"}
            borderRadius={50}
            text="Add Address"
            onPress={() =>
              router.push("/dashboard/home/address-book/add-address")
            }
          />
        )}
      </Box>
    </PageWrapper>
  );
};

export default Addresses;
