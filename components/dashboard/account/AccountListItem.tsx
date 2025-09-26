import icons from "@/assets/icons";
import { BankAccount } from "@/interfaces/account.interface";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { MoreVertical } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable } from "react-native";
import { Box, CustomText } from "../../general";

interface AccountListItemProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

const AccountListItem: React.FC<AccountListItemProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme<Theme>();
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(account);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(account);
  };

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="m"
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        <Box
          width={40}
          height={40}
          borderRadius={20}
          bg="primaryColor"
          alignItems="center"
          justifyContent="center"
          marginRight="m"
        >
          <CustomText color="white" fontSize={16} fontWeight="bold">
            {account.accountHolderName.charAt(0).toUpperCase()}
          </CustomText>
        </Box>

        <Box flex={1}>
          <CustomText variant="bodyBold" color="headerTextColor">
            {account.accountHolderName}
          </CustomText>
          <CustomText variant="body" color="bodyTextColor" fontSize={12}>
            {account.accountNumber}
          </CustomText>
        </Box>
      </Box>

      <Box position="relative">
        <Pressable
          onPress={handleMenuPress}
          style={{
            padding: 8,
            borderRadius: 4,
          }}
          android_ripple={{
            color: "rgba(255,255,255,0.1)",
            borderless: true,
          }}
        >
          <MoreVertical size={20} color={theme.colors.bodyTextColor} />
        </Pressable>

        {showMenu && (
          <Box
            position="absolute"
            top={40}
            right={0}
            bg="mainBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="borderColor"
            minWidth={120}
            zIndex={1000}
          >
            <Pressable
              onPress={handleEdit}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.borderColor,
                flexDirection: "row",
                alignItems: "center",
              }}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: false,
              }}
            >
              <Image
                source={icons.edit}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <CustomText variant="body" color="headerTextColor">
                Edit
              </CustomText>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: false,
              }}
            >
              <Image
                source={icons.deleteIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <CustomText variant="body" color="error">
                Delete
              </CustomText>
            </Pressable>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AccountListItem;
