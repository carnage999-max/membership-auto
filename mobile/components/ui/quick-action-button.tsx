import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  onPress: () => void;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  title,
  onPress,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn('flex-1 items-center', className)}
      activeOpacity={0.7}
    >
      <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
        <Icon size={28} color="#cba86e" />
      </View>
      <Text className="text-center text-xs font-medium text-textSecondary" numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
