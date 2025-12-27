import { cn } from '@utils/cn';
import theme from '@utils/theme';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface VariantProps {
  container: string;
  text: string;
  icon?: string;
}

// Updated variants to match frontend design with better spacing and modern styling
const variants = {
  default: {
    container: cn('rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3.5'),
    text: cn('font-semibold text-white text-base'),
    icon: cn('text-white'),
  },
  filled: {
    container: cn('rounded-lg bg-primary px-6 py-3.5'),
    text: cn('font-semibold text-black text-base'),
    icon: cn('text-black'),
  },
  danger: {
    container: cn('rounded-lg bg-red-500 px-6 py-3.5'),
    text: cn('font-semibold text-white text-base'),
    icon: cn('text-white'),
  },
  outline: {
    container: cn('rounded-lg border-2 border-primary bg-transparent px-6 py-3.5'),
    text: cn('font-semibold text-primary text-base'),
    icon: cn('text-primary'),
  },
  ghost: {
    container: cn('rounded-lg bg-transparent px-6 py-3.5'),
    text: cn('font-semibold text-zinc-300 text-base'),
    icon: cn('text-zinc-300'),
  },
} satisfies Record<string, VariantProps>;

const getVariant = (variant: keyof typeof variants) => variants[variant];

export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  loading?: boolean;
  disabled?: boolean;
  fitted?: boolean;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  feedbackText?: string;

  // Don't wrap with text component
  asChild?: boolean;
}

const Button = ({
  children,
  className,
  onPress,
  variant = 'default',
  loading = false,
  disabled = false,
  fitted = false,
  iconLeft,
  iconRight,
  feedbackText,
  asChild,
  ...rest
}: ButtonProps) => {
  const { container, text, icon } = getVariant(variant);

  // Shared value for animation
  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(30);

  const handlePress = () => {
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 1000 }, () => {
        feedbackTranslateY.value = 30;
      }),
    );
    feedbackTranslateY.value = withTiming(0, { duration: 300 });

    onPress?.();
  };

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ translateY: feedbackTranslateY.value }],
  }));

  const childStyle = useAnimatedStyle(() => ({
    opacity: 1 - feedbackOpacity.value,
    transform: [{ translateY: feedbackTranslateY.value - 30 }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      className={clsx(
        container,
        'flex justify-center overflow-hidden',
        fitted && 'self-baseline',
        disabled && 'opacity-50',
        className,
      )}
      {...rest}>
      {loading && (
        <View className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center">
          <ActivityIndicator
            size="small"
            color={variant === 'filled' ? '#000000' : '#cba86e'}
          />
        </View>
      )}

      <View
        className={clsx(
          'flex-row items-center justify-center gap-2',
          fitted && 'self-baseline',
        )}>
        {iconLeft &&
          React.createElement(iconLeft, {
            size: 20,
            className: clsx(icon),
          })}
        <Animated.View style={feedbackText ? childStyle : undefined}>
          {asChild ? (
            children
          ) : (
            <Text className={clsx(text, 'text-center')}>{children}</Text>
          )}
        </Animated.View>
        {feedbackText && (
          <Animated.View
            className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center"
            style={[feedbackStyle, { position: 'absolute', bottom: 0 }]}>
            <Text className={clsx(text, 'text-center')}>{feedbackText}</Text>
          </Animated.View>
        )}
        {iconRight &&
          React.createElement(iconRight, {
            size: 20,
            className: clsx(icon),
          })}
      </View>
    </TouchableOpacity>
  );
};

export { Button };
export default Button;
