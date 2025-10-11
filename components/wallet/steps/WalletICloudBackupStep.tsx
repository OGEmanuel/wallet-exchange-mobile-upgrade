import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import Identicon from "@/components/general/Identicon";
import ZapLoader from "@/components/general/ZapLoader";
import { iCloudBackupService, WalletGroupBackup } from "@/src/core/storage/icloud-backup.service";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, TouchableWithoutFeedback } from "react-native";


// Use the real WalletGroupBackup interface from the service

interface WalletICloudBackupStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletICloudBackupStep: React.FC<WalletICloudBackupStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [walletGroups, setWalletGroups] = useState<WalletGroupBackup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load real backups from iCloud
  useEffect(() => {
    const loadBackups = async () => {
      try {
        setIsLoadingBackups(true);
        setHasError(false);
        
        console.log('🔍 Loading wallet group backups from iCloud...');
        
        // Check if iCloud is available
        const isICloudAvailable = await iCloudBackupService.isICloudAvailable();
        if (!isICloudAvailable) {
          console.log('⚠️ iCloud backup not available on this device');
          setHasError(true);
          setWalletGroups([]);
          return;
        }
        
        // Load actual backups
        const backups = await iCloudBackupService.getWalletGroupBackups();
        console.log(`📦 Found ${backups.length} wallet group backups`);
        
        if (backups.length === 0) {
          setHasError(true);
          setWalletGroups([]);
        } else {
          setWalletGroups(backups);
        }
      } catch (error) {
        console.error('❌ Failed to load backups:', error);
        setHasError(true);
        setWalletGroups([]);
      } finally {
        setIsLoadingBackups(false);
      }
    };

    loadBackups();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Format address to show start and end like "0x775e...50c3"
  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleGroupSelect = (group: WalletGroupBackup) => {
    // Store the selected group in wallet data
    onUpdateData({ selectedWalletGroup: group });
    // Continue to next step (restore screen)
    onContinue();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoadingBackups(true);
    // Retry loading backups
    setTimeout(() => {
      setWalletGroups([]);
      setHasError(true);
      setIsLoadingBackups(false);
    }, 1000);
  };

  // Removed alert popup - using embedded UI instead

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor" paddingTop="xl">
      <AppBar
        leading={
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 20,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <ChevronLeft size={24} color={theme.colors.bodyTextColor} />
          </Pressable>
        }
        title="iCloud Backup"
        paddingHorizontal={10}
        fontSize={18}
      />

      <TouchableWithoutFeedback>
        <Box flex={1} paddingHorizontal="m">
          {isLoadingBackups ? (
            // Loading state
            <Box flex={1} justifyContent="center" alignItems="center">
              <ZapLoader
                size={80}
                text="Loading backups..."
              />
            </Box>
          ) : walletGroups.length === 0 ? (
            // No backups found state
            <Box flex={1} justifyContent="center" alignItems="center" paddingHorizontal="l">
              <Box
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="secondaryBackgroundColor"
                justifyContent="center"
                alignItems="center"
                mb="l"
              >
                <AlertCircle size={40} color={theme.colors.bodyTextColor} />
              </Box>
              <CustomText variant="medium" fontSize={20} color="white" mb="m" textAlign="center">
                No Backups Found
              </CustomText>
              <CustomText variant="body" fontSize={14} color="bodyTextColor" textAlign="center" mb="l">
                No wallet backups were found in your iCloud or Google Drive. Make sure you have backed up your wallets before trying to restore them.
              </CustomText>
              <Pressable
                onPress={handleRetry}
                style={({ pressed }) => ({
                  backgroundColor: theme.colors.primaryColor,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <CustomText variant="medium" fontSize={16} color="white">
                  Try Again
                </CustomText>
              </Pressable>
            </Box>
          ) : (
            // Show wallet groups
            walletGroups.map((group) => (
              <Pressable 
                key={group.id} 
                onPress={() => handleGroupSelect(group)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.3 : 1,
                })}
              >
                <Box
                  width="100%"
                  height="auto"
                  borderWidth={1}
                  borderRadius={20}
                  borderColor="borderColor"
                  mb="l"
                  p="m"
                >
                  <Box
                    flexDirection="row"
                    width="100%"
                    justifyContent="space-between"
                    alignItems="center"
                    mb="m"
                  >
                    <Box flexDirection="row" alignItems="center">
                      <CustomText fontSize={12} color="white">
                        {group.name}
                      </CustomText>
                      <Box
                        style={{ padding: 5 }}
                        borderRadius={50}
                        bg="secondaryBackgroundColor"
                        ml="s"
                      >
                        <CustomText variant="light" fontSize={10} color="white">
                          {group.wallets.length} wallets
                        </CustomText>
                      </Box>
                    </Box>
                    <ChevronRight size={25} color={theme.colors.bodyTextColor} />
                  </Box>

                  {group.wallets.map((wallet) => (
                    <Box key={wallet.id} flexDirection="row" alignItems="center" mb="m">
                      <Box
                        width={36}
                        height={36}
                        borderRadius={3.8}
                        bg="secondaryBackgroundColor"
                        overflow="hidden"
                      >
                        <Identicon
                          value={wallet.address}
                          size={36}
                        />
                      </Box>
                      <Box ml="s">
                        <CustomText variant="medium" fontSize={14} color="bodyTextColor">
                          {wallet.name}
                        </CustomText>
                        <CustomText fontSize={12} variant="body" color="disabledTextColor">
                          {formatAddress(wallet.address)}
                        </CustomText>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Pressable>
            ))
          )}
        </Box>
      </TouchableWithoutFeedback>
    </Box>
  );
};
