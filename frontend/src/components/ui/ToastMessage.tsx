type ToastMessageProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

const palette = {
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  error: 'bg-rose-50 text-rose-900 border-rose-200',
  info: 'bg-sky-50 text-sky-900 border-sky-200',
};

export const ToastMessage = ({ message, type = 'info' }: ToastMessageProps) => {
  return (
    <div className={`border ${palette[type]} rounded-2xl px-4 py-3 shadow-sm max-w-md`}>
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
};
