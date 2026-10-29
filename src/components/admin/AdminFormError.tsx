export const AdminFormError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="text-destructive text-sm leading-6 break-words">
      {message}
    </p>
  ) : null;
