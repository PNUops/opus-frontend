import { ToastType, useToastStore } from '@stores/useToastStore';

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  const toast = (message: string, type: ToastType = 'info'): void => {
    addToast(message, type);
  };

  return toast;
};
