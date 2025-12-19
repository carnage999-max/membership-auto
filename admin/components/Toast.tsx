'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success bg-opacity-10',
      borderColor: 'border-success',
      textColor: 'text-success',
      iconColor: 'text-success',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-error bg-opacity-10',
      borderColor: 'border-error',
      textColor: 'text-error',
      iconColor: 'text-error',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning bg-opacity-10',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      iconColor: 'text-warning',
    },
    info: {
      icon: Info,
      bgColor: 'bg-info bg-opacity-10',
      borderColor: 'border-info',
      textColor: 'text-info',
      iconColor: 'text-info',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} ${borderColor} shadow-lg animate-slide-in-right max-w-md`}
    >
      <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
      <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 transition-opacity shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
