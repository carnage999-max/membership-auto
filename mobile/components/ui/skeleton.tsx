import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/utils/cn';

interface SkeletonProps extends ViewProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: (width as any) || '100%',
          height: (height as any) || 20,
        },
        animatedStyle,
        style,
      ]}
      className={cn('bg-zinc-800 rounded-md', className)}
      {...props}
    />
  );
};

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <View className={cn('rounded-xl bg-surface p-5', className)}>
    <Skeleton height={24} className="mb-4 w-3/4" />
    <Skeleton height={16} className="mb-2 w-full" />
    <Skeleton height={16} className="w-5/6" />
  </View>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton height={48} className={cn('rounded-lg', className)} />
);

export const SkeletonQuickAction: React.FC<{ className?: string }> = ({ className }) => (
  <View className={cn('items-center py-2', className)}>
    <Skeleton height={80} width={80} className="mb-3 rounded-2xl" />
    <Skeleton height={12} width={60} className="rounded-md" />
  </View>
);
