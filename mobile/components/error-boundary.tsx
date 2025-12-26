import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-error/20">
            <AlertCircle size={48} color="#dd4a48" />
          </View>

          <Text className="mb-2 text-center text-2xl font-bold text-foreground">
            Oops! Something went wrong
          </Text>

          <Text className="mb-6 text-center text-sm text-textSecondary">
            We're sorry for the inconvenience. The error has been reported and we'll fix it
            soon.
          </Text>

          {__DEV__ && this.state.error && (
            <ScrollView className="mb-6 max-h-40 w-full rounded-lg bg-surface p-4">
              <Text className="text-xs font-mono text-error">
                {this.state.error.toString()}
              </Text>
              {this.state.error.stack && (
                <Text className="mt-2 text-xs font-mono text-textMuted">
                  {this.state.error.stack}
                </Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={this.handleReset}
            className="flex-row items-center rounded-lg bg-gold px-6 py-3"
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color="#0d0d0d" />
            <Text className="ml-2 font-semibold text-background">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
