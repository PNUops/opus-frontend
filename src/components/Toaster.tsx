import { MdCancel, MdCheckCircle, MdInfo } from 'react-icons/md';
import { Toast, useToastStore } from '@stores/useToastStore';

interface ToastProps {
  toast: Toast;
}

const ToastItem = ({ toast }: ToastProps) => {
  const backgroundColor = {
    success: 'bg-mainGreen',
    error: 'bg-mainRed',
    info: 'bg-mainBlue',
  }[toast.type || 'info'];

  const Icon = {
    success: MdCheckCircle,
    error: MdCancel,
    info: MdInfo,
  }[toast.type || 'info'];

  return (
    <div
      className={`flex min-h-[45px] w-[240px] items-center gap-1 rounded-md pl-3 text-white shadow-sm md:min-h-[60px] md:w-[320px] md:text-lg ${backgroundColor} animate-fade-slide-in-out`}
    >
      <Icon className="text-xl md:text-2xl" />
      {toast.message}
    </div>
  );
};

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed right-10 bottom-10 z-50 flex flex-col-reverse gap-3">
      {[...toasts].reverse().map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
