import useToastStore from './stores/toast-store';

export const showToast = (
  type: 'error' | 'success' | 'info',
  message: string
) => {
  useToastStore.getState().setToast({ type, message });

  // Auto-hide after 3 seconds
  setTimeout(() => {
    useToastStore.getState().setToast(null);
  }, 3000);
};
