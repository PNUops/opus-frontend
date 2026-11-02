import { MdCancel, MdCheckCircle, MdInfo } from 'react-icons/md';
import { Toast, useToastStore } from '@stores/useToastStore';

interface ToastProps {
  toast: Toast;
}

const toastAppearance = {
  success: { Icon: MdCheckCircle, iconClassName: 'text-mainGreen', label: '성공' },
  error: { Icon: MdCancel, iconClassName: 'text-mainRed', label: '오류' },
  info: { Icon: MdInfo, iconClassName: 'text-mainBlue', label: '안내' },
};

const ToastItem = ({ toast }: ToastProps) => {
  const { Icon, iconClassName, label } = toastAppearance[toast.type || 'info'];

  return (
    <div className="border-lightGray animate-fade-slide-in-out flex items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm leading-6 font-normal text-neutral-900 shadow-sm">
      <Icon className={`mt-0.5 size-5 shrink-0 ${iconClassName}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 [overflow-wrap:anywhere] break-keep">
        <span className="sr-only">{label}: </span>
        {toast.message}
      </p>
    </div>
  );
};

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
      className="pointer-events-none fixed right-4 bottom-4 left-4 z-[100] flex flex-col-reverse gap-3 sm:right-6 sm:bottom-6 sm:left-auto sm:w-96"
    >
      {[...toasts].reverse().map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
