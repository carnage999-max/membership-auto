import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

type ToastType = 'error' | 'success' | 'info';

interface InlineToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const InlineToast = ({
  type,
  message,
  visible,
  onHide,
  duration = 3000,
}: InlineToastProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1);
      translateY.value = withSpring(0);

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Auto-hide after duration
      timerRef.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onHide)();
        });
        translateY.value = withTiming(-20, { duration: 200 });
      }, duration);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-20, { duration: 200 });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(244, 67, 54, 0.95)';
      case 'success':
        return 'rgba(76, 175, 80, 0.95)';
      case 'info':
        return 'rgba(33, 150, 243, 0.95)';
      default:
        return 'rgba(97, 97, 97, 0.95)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} color="#ffffff" />;
      case 'success':
        return <CheckCircle size={20} color="#ffffff" />;
      case 'info':
        return <Info size={20} color="#ffffff" />;
      default:
        return <AlertCircle size={20} color="#ffffff" />;
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 99999,
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      {getIcon()}
      <Text
        style={{
          flex: 1,
          marginLeft: 12,
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '500',
        }}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

export default InlineToast;
