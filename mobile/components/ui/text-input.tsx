import { cn } from '@/utils/cn';
import React, { forwardRef, useState } from 'react';
import { Text, TextInput as RNTextInput, TextInputProps, View } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const TextInput = forwardRef<RNTextInput, CustomTextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      inputClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={cn('mb-4', containerClassName)}>
        {label && (
          <Text className="mb-2 text-sm font-medium text-foreground">{label}</Text>
        )}

        <View
          className={cn(
            'flex-row items-center rounded-lg border bg-surface px-4',
            isFocused ? 'border-gold' : error ? 'border-error' : 'border-border',
            className
          )}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <RNTextInput
            ref={ref}
            className={cn(
              'flex-1 py-3 text-base text-foreground',
              inputClassName
            )}
            placeholderTextColor="#707070"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>

        {(error || helperText) && (
          <Text className={cn('mt-1 text-sm', error ? 'text-error' : 'text-textMuted')}>
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';
