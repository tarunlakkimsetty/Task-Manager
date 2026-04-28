import React, { useState, useEffect } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: Check,
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        }
      case 'error':
        return {
          icon: X,
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        }
      default:
        return {
          icon: Check,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, x: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 max-w-sm z-50 ${config.bg} border ${config.border} rounded-lg p-4 flex gap-3`}
        >
          <div className={`flex-shrink-0 ${config.iconBg} p-2 rounded-lg`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.text}`}>{message}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className={`text-2xl leading-none ${config.text} hover:opacity-70`}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
