import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react-native';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  variant?: 'gold' | 'outline' | 'ghost';
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onPress,
  loading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  variant = 'gold',
  className,
}) => {
  const isDisabled = loading || disabled;

  const containerStyles = {
    gold: 'bg-gold',
    outline: 'border-2 border-gold bg-transparent',
    ghost: 'bg-transparent',
  };

  const textStyles = {
    gold: 'text-background',
    outline: 'text-gold',
    ghost: 'text-gold',
  };

  const iconColor = {
    gold: '#0d0d0d',
    outline: '#cba86e',
    ghost: '#cba86e',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center rounded-xl py-4 px-6',
        containerStyles[variant],
        isDisabled && 'opacity-60',
        className
      )}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {IconLeft && <IconLeft size={20} color={iconColor[variant]} />}
          <Text className={cn('text-base font-semibold', textStyles[variant])}>
            {children}
          </Text>
          {IconRight && <IconRight size={20} color={iconColor[variant]} />}
        </View>
      )}
    </TouchableOpacity>
  );
};
