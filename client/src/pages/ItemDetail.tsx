import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

const categories = [
  { id: '1', name: 'Food' },
  { id: '2', name: 'Transport' },
  { id: '3', name: 'Entertainment' },
  { id: '4', name: 'Shopping' },
  { id: '5', name: 'Bills' },
  { id: '6', name: 'Salary' },
  { id: '7', name: 'Freelance' },
];

// Mock data - in real app this would come from API
const mockItem = {
  id: 1,
  title: 'Grocery Shopping',
  amount: 85.00,
  type: 'expense' as const,
  category: 'Food',
  categoryId: '1',
  date: '2025-01-15',
  notes: 'Weekly groceries from supermarket',
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-15T10:30:00Z',
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: mockItem.title,
      amount: mockItem.amount,
      type: mockItem.type,
      categoryId: mockItem.categoryId,
      date: mockItem.date,
      notes: mockItem.notes,
    },
  });

  const onSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Transaction updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Transaction deleted successfully!');
      navigate('/items');
    } catch (error: any) {
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate('/items')}
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {isEditing ? 'Edit Transaction' : 'Transaction Details'}
            </h1>
            <p className="text-secondary-600 mt-2">
              {isEditing ? 'Update transaction information' : 'View transaction details'}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
        {isEditing ? (
          // Edit Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Transaction Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    {...register('type')}
                    type="radio"
                    value="income"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <span className="ml-2 text-sm text-secondary-700">Income</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('type')}
                    type="radio"
                    value="expense"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <span className="ml-2 text-sm text-secondary-700">Expense</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="input"
                placeholder="Enter transaction title"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-secondary-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                    $
                  </span>
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="form-error">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-secondary-700 mb-2">
                  Date *
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="input"
                />
                {errors.date && (
                  <p className="form-error">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-secondary-700 mb-2">
                Category
              </label>
              <select {...register('categoryId')} className="input">
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-secondary-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn btn-primary"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          // View Details
          <div className="space-y-6">
            {/* Transaction Overview */}
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {mockItem.title}
                </h3>
                <p className="text-secondary-600">
                  {new Date(mockItem.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  mockItem.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mockItem.type === 'income' ? '+' : '-'}${mockItem.amount.toFixed(2)}
                </p>
                <p className="text-sm text-secondary-500 capitalize">
                  {mockItem.type}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-500 mb-1">
                  Category
                </label>
                <p className="text-secondary-900">
                  {mockItem.category || 'No category'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-500 mb-1">
                  Type
                </label>
                <p className="text-secondary-900 capitalize">
                  {mockItem.type}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-500 mb-1">
                  Created
                </label>
                <p className="text-secondary-900">
                  {new Date(mockItem.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-500 mb-1">
                  Last Updated
                </label>
                <p className="text-secondary-900">
                  {new Date(mockItem.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Notes */}
            {mockItem.notes && (
              <div>
                <label className="block text-sm font-medium text-secondary-500 mb-1">
                  Notes
                </label>
                <p className="text-secondary-900 bg-secondary-50 p-3 rounded-lg">
                  {mockItem.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}