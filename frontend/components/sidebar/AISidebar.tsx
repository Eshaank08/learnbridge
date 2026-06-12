"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import AIPanel, { AIPanelProps } from "./AIPanel";

type Props = AIPanelProps & {
  open: boolean;
  onClose: () => void;
};

export default function AISidebar({ open, onClose, ...panelProps }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-gray-900 text-sm font-medium">AI Learning Tools</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <AIPanel {...panelProps} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
