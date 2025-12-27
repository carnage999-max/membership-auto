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
      className={cn('items-center py-2', className)}
      activeOpacity={0.7}
    >
      <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700">
        <Icon size={32} color="#cba86e" />
      </View>
      <Text className="text-center text-xs font-medium text-textSecondary leading-tight px-1" numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
