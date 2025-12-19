'use client';

import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-[#DD4A48]',
          iconBg: 'bg-[#DD4A48]/10',
          button: 'bg-[#DD4A48] hover:bg-[#C43E3B]',
        };
      case 'warning':
        return {
          icon: 'text-[#F59E0B]',
          iconBg: 'bg-[#F59E0B]/10',
          button: 'bg-[#F59E0B] hover:bg-[#D97706]',
        };
      case 'info':
        return {
          icon: 'text-[#CBA86E]',
          iconBg: 'bg-[#CBA86E]/10',
          button: 'bg-[#CBA86E] hover:bg-[#B89860]',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center shrink-0`}>
              <AlertCircle className={colors.icon} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-[#B3B3B3]">{message}</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[#707070] hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-[#0D0D0D] border border-[#2A2A2A] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-3 ${colors.button} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
