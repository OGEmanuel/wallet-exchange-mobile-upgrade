import { Bank, UserBankAccount } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { useState } from "react";
import Box from "./Box";
import CustomText from "./CustomText";

interface BankIconProps {
  bank?: Bank | null;
  bankAccount?: UserBankAccount | null;
  size?: number;
  borderRadius?: number;
  showInitials?: boolean;
}

/**
 * Utility function to get initials from a name
 */
const getInitials = (name?: string | null, maxLength: number = 2): string => {
  if (!name || name.trim().length === 0) return "B";
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Single word - take first 2 characters
    return name.substring(0, maxLength).toUpperCase();
  }
  
  // Multiple words - take first letter of first two words
  return (words[0]?.[0] || "") + (words[1]?.[0] || words[0]?.[1] || "");
};

/**
 * BankIcon component with fallback to initials
 * Displays bank icon if available, otherwise shows initials in a colored circle
 */
const BankIcon: React.FC<BankIconProps> = ({
  bank,
  bankAccount,
  size = 40,
  borderRadius = 20,
  showInitials = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine which icon to use
  const bankIdObj = bankAccount?.bankId as unknown as Bank;
  const iconUri = bank?.icon || bankIdObj?.icon;
  
  // Determine which name to use for initials
  const nameForInitials = bank?.name || bankAccount?.name || bankIdObj?.name || "Bank";
  
  // Get initials
  const initials = getInitials(nameForInitials);

  // If we have an icon and no error, show the image
  if (iconUri && !imageError) {
    return (
      <Box
        width={size}
        height={size}
        borderRadius={borderRadius}
        overflow="hidden"
        backgroundColor="secondaryBackgroundColor"
      >
        <Image
          source={{ uri: iconUri }}
          style={{ width: size, height: size }}
          contentFit="contain"
          onError={() => setImageError(true)}
        />
      </Box>
    );
  }

  // Fallback to initials
  if (!showInitials) {
    return (
      <Box
        width={size}
        height={size}
        borderRadius={borderRadius}
        backgroundColor="secondaryBackgroundColor"
      />
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={borderRadius}
      backgroundColor="primaryColor"
      alignItems="center"
      justifyContent="center"
    >
      <CustomText
        variant="body"
        color="white"
        fontSize={size * 0.35}
        fontWeight="600"
      >
        {initials}
      </CustomText>
    </Box>
  );
};

export default BankIcon;
export { getInitials };

