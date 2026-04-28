import React, { forwardRef } from 'react'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { motion } from 'framer-motion'

const TaskCard = forwardRef(({ task, onToggle, onDelete, onShowConfirm }, ref) => {
  const isCompleted = task.status === 'completed'

  const handleDelete = () => {
    onShowConfirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      onConfirm: () => onDelete(task.id),
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        {/* Status Toggle */}
        <button
          onClick={() => onToggle(task.id, task.status)}
          className="flex-shrink-0 mt-1 text-slate-400 hover:text-primary-600 transition group-hover:scale-110"
        >
          {isCompleted ? (
            <CheckCircle2
              size={24}
              className="text-green-600"
              fill="currentColor"
            />
          ) : (
            <Circle size={24} className="text-slate-300" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold ${
              isCompleted
                ? 'text-slate-400 line-through'
                : 'text-slate-900'
            } break-words`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-sm mt-2 ${
                isCompleted
                  ? 'text-slate-300 line-through'
                  : 'text-slate-600'
              } break-words`}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span
              className={`badge ${
                isCompleted ? 'badge-completed' : 'badge-pending'
              }`}
            >
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200 opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  )
})

TaskCard.displayName = 'TaskCard'

export default TaskCard
