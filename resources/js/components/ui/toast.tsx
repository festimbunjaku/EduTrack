import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const ToastProvider = React.createContext<{
  open: (content: string, variant?: "default" | "success" | "error") => void;
  close: () => void;
} | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastProvider);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastVariants = cva(
  "fixed top-4 right-4 z-50 max-w-md rounded-md shadow-lg p-4 flex items-center gap-2 transition-opacity duration-300",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
        success: "bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800",
        error: "bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  children: React.ReactNode;
  className?: string;
}

export const Toast = ({ children, variant, className }: ToastProps) => {
  return (
    <div className={cn(toastVariants({ variant }), className)}>
      {children}
    </div>
  );
};

interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const [toast, setToast] = React.useState<{
    content: string;
    visible: boolean;
    variant: "default" | "success" | "error";
  }>({
    content: "",
    visible: false,
    variant: "default",
  });

  const open = (content: string, variant: "default" | "success" | "error" = "default") => {
    setToast({
      content,
      visible: true,
      variant,
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      close();
    }, 5000);
  };

  const close = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastProvider.Provider value={{ open, close }}>
      {children}
      {toast.visible && (
        <Toast variant={toast.variant}>
          <div className="flex-1">{toast.content}</div>
          <button onClick={close} className="text-current">
            <X className="h-4 w-4" />
          </button>
        </Toast>
      )}
    </ToastProvider.Provider>
  );
}; 