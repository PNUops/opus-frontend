import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { RxCross2 } from 'react-icons/rx';

import { cn } from '@components/lib/utils';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.DialogTrigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogContent({
  className,
  children,
  closeDisabled = false,
  appearance = 'default',
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  closeDisabled?: boolean;
  appearance?: 'default' | 'admin';
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/30"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (appearance === 'admin' && closeDisabled) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (appearance === 'admin' && closeDisabled) event.preventDefault();
        }}
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-fit -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 border p-7 pt-9 pr-9 shadow-lg duration-200 sm:rounded-lg',
          className,
          appearance === 'admin' &&
            'max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)] items-stretch gap-6 overflow-y-auto rounded-lg p-6 text-neutral-900 [&_[data-slot=dialog-title]]:pr-8 [&_[data-slot=dialog-title]]:text-left [&_[data-slot=dialog-title]]:text-xl [&_[data-slot=dialog-title]]:leading-7 [&_[data-slot=dialog-title]]:font-semibold',
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          asChild
          disabled={closeDisabled}
          className={cn(
            'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none',
            appearance === 'admin' &&
              'focus:ring-mainBlue hover:bg-whiteGray flex size-11 items-center justify-center rounded-md text-neutral-600 opacity-100',
          )}
        >
          <button type="button" disabled={closeDisabled}>
            <RxCross2 size={20} />
            <span className="sr-only">{appearance === 'admin' ? '닫기' : 'Close'}</span>
          </button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" asChild>
      <h3 className={cn('"text-center text-gray-800" text-lg font-semibold', className)} {...props} />
    </DialogPrimitive.Title>
  );
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose };
