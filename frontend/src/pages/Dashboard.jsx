import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Loader, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { taskAPI } from '../services/api'
import { useToast } from '../hooks/useToast'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toasts, showToast, removeToast } = useToast()

  // Calculate stats dynamically from tasks array
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      progress,
    }
  }, [tasks])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await taskAPI.getTasks()
      setTasks(response.data.tasks || [])
    } catch (error) {
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!title.trim()) {
      showToast('Please enter a task title', 'error')
      return
    }

    try {
      setIsCreating(true)
      await taskAPI.createTask({
        title: title.trim(),
        description: description.trim(),
      })
      showToast('Task created successfully!', 'success')
      setTitle('')
      setDescription('')
      setIsModalOpen(false)
      fetchTasks()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create task', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId)
      await taskAPI.updateTask(taskId, {
        title: taskToUpdate.title,
        status: newStatus,
      })
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      )
      showToast(`Task marked as ${newStatus}!`, 'success')
    } catch (error) {
      showToast('Failed to update task', 'error')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      setIsDeleting(true)
      await taskAPI.deleteTask(taskId)
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))
      showToast('Task deleted successfully!', 'success')
      setConfirmDialog({ ...confirmDialog, isOpen: false })
    } catch (error) {
      showToast('Failed to delete task', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const showConfirmDialog = (config) => {
    setConfirmDialog({
      isOpen: true,
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
    })
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.status === 'completed'
    if (filter === 'pending') return task.status === 'pending'
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">My Tasks</h1>
              <p className="text-slate-600 mt-1">Stay organized and productive</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-lg"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertCircle className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-4 flex items-center gap-4"
              >
                <div className="bg-purple-100 p-3 rounded-lg">
                  <div className="text-purple-600 font-bold text-xl">{stats.progress}%</div>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Completion</p>
                  <p className="text-sm font-medium text-slate-900">Progress rate</p>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-600">Loading tasks...</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
              </h3>
              <p className="text-slate-600">
                {tasks.length === 0
                  ? 'Create your first task to get started'
                  : 'Try adjusting your filters'}
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary mt-6 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onShowConfirm={showConfirmDialog}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Create New Task"
        onClose={() => {
          setIsModalOpen(false)
          setTitle('')
          setDescription('')
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              maxLength="255"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/255</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              maxLength="5000"
              rows="4"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{description.length}/5000</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isCreating && <Loader size={16} className="animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        isLoading={isDeleting}
      />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
