import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Bank, UserBankAccount } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import { CheckCircle2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { CustomText } from "../general";
import Box from "../general/Box";

interface BankAccountCardProps {
  bankAccount: UserBankAccount;
  selected: boolean;
  onPress?: () => void;
}

const BankAccountCard = ({
  bankAccount,
  selected,
  onPress = () => {},
}: BankAccountCardProps) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="m"
        backgroundColor="secondaryBackgroundColor"
        padding="m"
        marginBottom={selected ? "l" : "s"}
        borderWidth={selected ? 1 : 0}
        borderColor={selected ? "secondaryColor" : "borderColor"}
        borderRadius={10}
      >
        <Box width={40} height={40} borderRadius={7} overflow="hidden">
          <Image
            source={{
              uri: (bankAccount.bankId as unknown as Bank)?.icon,
            }}
            style={{ width: 40, height: 40, borderRadius: 7 }}
          />
        </Box>

        <Box flex={1}>
          <CustomText
            variant="bodyBold"
            color="headerTextColor"
            fontSize={14}
            mb="s"
          >
            {bankAccount.name}
          </CustomText>
          <CustomText variant="body" color="placeholderTextColor" fontSize={13}>
            {bankAccount.number}
          </CustomText>
        </Box>
        {selected && (
          <Box alignItems="center" justifyContent="center">
            <CheckCircle2 size={25} color={theme.colors.secondaryColor} />
          </Box>
        )}
      </Box>
    </Pressable>
  );
};

export default BankAccountCard;
