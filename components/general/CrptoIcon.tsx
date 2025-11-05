import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import Box from "@/components/general/Box";
import SmartImage from "@/components/general/SmartImage";
import { useState } from "react";
import { CustomText } from ".";



const CryptoIcon = ({
  image,
  size = 32,
  symbol,
}: {
  image?: string;
  size?: number;
  symbol?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size / 2}
      overflow="hidden"
      justifyContent="center"
      alignItems="center"
      borderWidth={0}
    >
      {image && !imageError ? (
        <SmartImage
          source={{ uri: image }}
          width={size}
          height={size}
          onError={(error) => {
            console.log("Failed to load token image:", image);
            setImageError(true);
          }}
        />
      ) : symbol ? (
        <CustomText fontSize={size * 0.4} color="white" fontWeight="bold">
          {symbol.charAt(0)}
        </CustomText>
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
};

export default CryptoIcon;