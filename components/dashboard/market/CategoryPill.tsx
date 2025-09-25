import React, { memo } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Text } from '..';
import { useColorScheme } from 'nativewind';

interface CategoryItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryPill: React.FC<CategoryItemProps> = memo(
  ({ label, selected, onPress }) => {
    const { colorScheme: scheme } = useColorScheme();

    const itemStyles = `h-7 px-[12px] py-1 mt-3 mr-1 rounded-full items-center justify-center  flex flex-row ${selected
      ? scheme === 'dark'
        ? `bg-[#232B0F] border border-stroke dark:border-[#C7E64D]`
        : `bg-[#F1F1FF] border border-primary`
      : 'bg-background dark:bg-[#1F232D]  border-stroke'
      }`;

    return (
      <TouchableOpacity onPress={onPress} className={itemStyles}>
        <Text
          className={
            selected
              ? scheme === 'dark'
                ? 'text-[#C7E64D] text-[10px]'
                : 'text-primary'
              : 'text-[10px] text-text dark:text-dark-text'
          }>
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
);

export default CategoryPill;
