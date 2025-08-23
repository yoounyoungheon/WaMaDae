"use client";

import { useEffect } from "react";
import { useToastStore } from "./toast-store";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-row gap-3 items-center px-4 py-2 rounded shadow bg-mysom-darkgray text-white`}
          >
            <div className={`w-3 h-3 rounded-full ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-yellow-300"
            }`}/>
            <div>{toast.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
