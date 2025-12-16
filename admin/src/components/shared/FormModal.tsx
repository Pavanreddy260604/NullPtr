import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // New slot for sticky action buttons
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] sm:max-w-[90vw]',
};

const FormModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  // 1. Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 2. Handle Escape Key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">

          {/* --- Backdrop --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* --- Modal Container --- */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative w-full bg-card text-card-foreground border-t sm:border border-border/50 shadow-2xl',
              // Mobile: Full width, rounded top corners, slide up from bottom
              'rounded-t-2xl sm:rounded-xl',
              // Height constraints
              'max-h-[95vh] sm:max-h-[90vh]',
              'flex flex-col',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Mobile drag indicator */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* 1. Header (Sticky) */}
            <div className="flex items-start justify-between p-4 sm:p-5 border-b border-border/40 shrink-0">
              <div className="space-y-1 pr-8 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight truncate">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* 2. Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar overscroll-contain">
              {children}
            </div>

            {/* 3. Footer (Sticky - Optional) */}
            {footer && (
              <div className="flex items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-border/40 bg-muted/10 shrink-0 rounded-b-xl safe-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FormModal;