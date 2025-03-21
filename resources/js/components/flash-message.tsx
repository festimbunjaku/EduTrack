import { usePage } from '@inertiajs/react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
}

export function FlashMessage() {
  const props = usePage().props;
  const { flash = {} } = props as { flash?: FlashMessages };
  const [visible, setVisible] = useState(false);


  useEffect(() => {
    if (flash?.success || flash?.error || flash?.warning) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [flash]);

  const getIcon = () => {
    if (flash?.success) return <CheckCircle className="h-5 w-5 text-white" />;
    if (flash?.error) return <XCircle className="h-5 w-5 text-white" />;
    if (flash?.warning) return <AlertCircle className="h-5 w-5 text-white" />;
    return null;
  };

  const getMessage = () => {
    return flash?.success || flash?.error || flash?.warning || '';
  };

  const getBackgroundColor = () => {
    if (flash?.success) return 'bg-green-500';
    if (flash?.error) return 'bg-red-500';
    if (flash?.warning) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed right-4 top-4 z-50 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex items-center space-x-3 rounded-lg p-4 shadow-lg',
              getBackgroundColor(),
            )}
          >
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 text-white">
              {getMessage()}
            </div>
            <button
              type="button"
              className="flex-shrink-0 rounded-md p-1 hover:bg-white/20 focus:outline-none"
              onClick={() => setVisible(false)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4 text-white" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 