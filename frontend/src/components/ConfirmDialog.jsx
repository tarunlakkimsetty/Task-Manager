import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto"
        >
          {/* Dialog Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 my-4"
          >
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600 mt-2">{message}</p>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="btn-danger disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
