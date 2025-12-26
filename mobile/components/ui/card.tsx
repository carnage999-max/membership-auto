import { cn } from '@/utils/cn';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <View
      className={cn(
        'rounded-lg bg-surface p-4',
        variant === 'elevated' && 'shadow-lg shadow-black/50',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};
