import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, RefreshCcw } from 'lucide-react-native';
import { Button } from './button';
import { cn } from '@/utils/cn';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <View className={cn('items-center justify-center py-12 px-6', className)}>
      <View className="mb-4 rounded-full bg-error/10 p-4">
        <AlertCircle size={32} color="#dd4a48" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Oops!
      </Text>
      <Text className="mb-6 text-center text-sm text-textSecondary">
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="outline"
          onPress={onRetry}
          iconLeft={RefreshCcw}
          className="px-8"
        >
          Try Again
        </Button>
      )}
    </View>
  );
};
