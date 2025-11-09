import {
  ThemedClockOutlineIcon,
  ThemedCopyIcon,
} from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomButton, CustomText } from "@/components/general";
import {
  selectBuyCurrency,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const ListItem = ({
  title,
  body,
}: {
  title: React.ReactNode;
  body: React.ReactNode;
}) => {
  return (
    <Box
      width={"100%"}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      height={30}
      mb="s"
    >
      {title}
      {body}
    </Box>
  );
};

const TransferDetailsStep = () => {
  const theme = useTheme<Theme>();
  const currency = useSelector(selectBuyCurrency);
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = React.useState(1);
  React.useEffect(() => {
    const sub = setTimeout(() => {
      dispatch(setBuyStage("confirming"));
    }, 10000);

    return () => clearTimeout(sub);
  }, []);
  return (
    <Box flex={1} paddingHorizontal="m" paddingTop="m">
      <SettingsHeader
        title="Transaction Details"
        onBackPress={() => dispatch(setBuyStage("buy"))}
      />
      <Box paddingHorizontal="m">
        <Box width={"100%"} alignItems="center" marginVertical="l">
          <Box
            width={"50%"}
            height={33}
            borderRadius={30}
            overflow="hidden"
            bg="secondaryBackgroundColor"
            flexDirection="row"
          >
            <CustomButton
              width={"40%"}
              text="Summary"
              height={33}
              borderRadius={33}
              color={currentTab === 1 ? "black" : "grey"}
              variant="bodySubheader"
              bgColor={
                currentTab === 1
                  ? "white"
                  : theme.colors.secondaryBackgroundColor
              }
              onPress={() => setCurrentTab(1)}
            />
            <CustomButton
              width={"60%"}
              text="Deposit Details"
              height={33}
              borderRadius={33}
              color={currentTab === 2 ? "black" : "grey"}
              variant="bodySubheader"
              bgColor={
                currentTab === 2
                  ? "white"
                  : theme.colors.secondaryBackgroundColor
              }
              onPress={() => setCurrentTab(2)}
            />
          </Box>
        </Box>

        <Box
          width={"100%"}
          height={88}
          borderRadius={12}
          justifyContent="center"
          alignItems="center"
          bg="secondaryBackgroundColor"
        >
          <CustomText variant="medium" fontSize={12} textAlign="center">
            YOU SEND
          </CustomText>

          <CustomText variant="subheader" mt="s">
            <CustomText fontSize={30} mr="m">
              {currency?.flag}
            </CustomText>{" "}
            100,000 NGN
          </CustomText>
        </Box>

        <Box
          width={"100%"}
          height={"auto"}
          borderRadius={12}
          bg="secondaryBackgroundColor"
          p="s"
          mt="l"
        >
          {currentTab === 1 && (
            <>
              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    You recieve:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    0.23 BNB
                  </CustomText>
                }
              />
              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    LP Fee:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    0.2 BNB
                  </CustomText>
                }
              />

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Recieving Address:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    0x1234...
                  </CustomText>
                }
              />

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Chain:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    BSC
                  </CustomText>
                }
              />

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Status:
                  </CustomText>
                }
                body={
                  <Pressable
                    style={{
                      width: 120,
                      height: 35,
                      borderRadius: 30,
                      borderWidth: 2,
                      borderColor: theme.colors.pendingColor,
                      backgroundColor: `${theme.colors.pendingColor}20`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CustomText
                      variant="medium"
                      fontSize={12}
                      color="pendingColor"
                    >
                      Pending
                    </CustomText>
                  </Pressable>
                }
              />
            </>
          )}
          {currentTab === 2 && (
            <>
              <Box
                width={"100%"}
                justifyContent="center"
                alignItems="center"
                marginVertical="m"
              >
                <CustomText
                  variant="medium"
                  fontSize={12}
                  textAlign="center"
                  style={{ width: "70%" }}
                >
                  Make your deposit using the account details provided below.
                </CustomText>
              </Box>

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Bank:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    Zenith Bank
                  </CustomText>
                }
              />

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Account Name:
                  </CustomText>
                }
                body={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="bodyTextColor"
                  >
                    ZAP technologyLi/jonath...
                  </CustomText>
                }
              />

              <ListItem
                title={
                  <CustomText
                    variant="medium"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Bank:
                  </CustomText>
                }
                body={
                  <Box flexDirection="row" alignItems="center">
                    <CustomText
                      variant="medium"
                      fontSize={12}
                      color="bodyTextColor"
                    >
                      23923848392
                    </CustomText>
                    <ThemedCopyIcon
                      lightModeColor={theme.colors.bodyTextColor}
                      darkModeColor={theme.colors.disabledTextColor}
                    />
                  </Box>
                }
              />

              <Box width={"100%"} alignItems="center">
                <Box
                  width={"50%"}
                  height={42}
                  borderRadius={50}
                  bg="mainBackgroundColor"
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal="m"
                >
                  <ThemedClockOutlineIcon />
                  <CustomText ml="s">
                    Expires in{" "}
                    <CustomText style={{ color: "green" }}>30:00</CustomText>
                  </CustomText>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {currentTab === 1 && (
          <>
            <Box
              width={"100%"}
              borderRadius={10}
              p="s"
              height={60}
              mt="m"
              mb="3xl"
              style={{ backgroundColor: `${theme.colors.pendingColor}20` }}
            >
              <Box
                borderLeftWidth={2}
                borderLeftColor="pendingColor"
                height={"100%"}
                width={"100%"}
                pl="m"
                justifyContent="center"
              >
                <CustomText fontSize={14}>
                  We will complete your transaction of 4,844,800 NGN after we
                  confirm receipt of your deposit
                </CustomText>
              </Box>
            </Box>

            <CustomButton
              width={"100%"}
              borderRadius={50}
              text="Show Deposit Details"
              onPress={() => setCurrentTab(2)}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default TransferDetailsStep;

