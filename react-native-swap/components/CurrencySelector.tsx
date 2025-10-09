import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SupportedCurrencyModel } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  currencies: SupportedCurrencyModel[];
  selectedCurrency?: SupportedCurrencyModel | null;
  onSelect: (currency: SupportedCurrencyModel) => void;
  title?: string;
}

const CurrencySelector: React.FC<Props> = ({
  visible,
  onClose,
  currencies,
  selectedCurrency,
  onSelect,
  title = 'Select Currency',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = currencies.filter((currency) => {
    const code = currency.currencyId?.code?.toLowerCase() || '';
    const symbol = currency.currencyId?.symbol?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return code.includes(query) || symbol.includes(query);
  });

  const handleSelect = (currency: SupportedCurrencyModel) => {
    onSelect(currency);
    setSearchQuery('');
  };

  const renderCurrencyItem = ({ item }: { item: SupportedCurrencyModel }) => {
    const isSelected = item._id === selectedCurrency?._id;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          isDark && styles.currencyItemDark,
          isSelected && styles.currencyItemSelected,
          isSelected && isDark && styles.currencyItemSelectedDark,
        ]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.currencyInfo}>
          {item.image || item.currencyId?.logo ? (
            <Image
              source={{ uri: item.image || item.currencyId?.logo }}
              style={styles.currencyImage}
            />
          ) : (
            <View style={[styles.currencyImagePlaceholder, isDark && styles.currencyImagePlaceholderDark]}>
              <Text style={styles.currencyImagePlaceholderText}>
                {item.currencyId?.code?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View style={styles.currencyDetails}>
            <Text style={[styles.currencyCode, isDark && styles.currencyCodeDark]}>
              {item.currencyId?.code}
            </Text>
            <Text style={[styles.currencySymbol, isDark && styles.currencySymbolDark]}>
              {item.currencyId?.symbol}
            </Text>
          </View>
        </View>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search currencies..."
              placeholderTextColor={isDark ? '#6D7076' : '#A7A7AF'}
              style={[styles.searchInput, isDark && styles.searchInputDark]}
            />
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item._id}
            renderItem={renderCurrencyItem}
            style={styles.list}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  No currencies found
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalContentDark: {
    backgroundColor: '#1F232D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: '#6D7076',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchContainerDark: {
    backgroundColor: '#2F333D',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 12,
  },
  searchInputDark: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  currencyItemDark: {
    borderBottomColor: '#2F333D',
  },
  currencyItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  currencyItemSelectedDark: {
    backgroundColor: '#1E3A5F',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  currencyImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyImagePlaceholderDark: {
    backgroundColor: '#4B5563',
  },
  currencyImagePlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7076',
  },
  currencyDetails: {
    gap: 2,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  currencyCodeDark: {
    color: '#fff',
  },
  currencySymbol: {
    fontSize: 12,
    color: '#6D7076',
  },
  currencySymbolDark: {
    color: '#A7A7AF',
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6D7076',
  },
  emptyTextDark: {
    color: '#A7A7AF',
  },
});

export default CurrencySelector;

