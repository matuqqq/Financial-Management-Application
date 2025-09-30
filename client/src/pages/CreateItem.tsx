import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload } from 'lucide-react';
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

export default function CreateItem() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchType = watch('type');

  const onSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Transaction created successfully!');
      navigate('/items');
    } catch (error: any) {
      toast.error('Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      >
        <button
          onClick={() => navigate('/items')}
          className="p-2 rounded-lg hover:bg-secondary-100 transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Add Transaction</h1>
          <p className="text-secondary-600 mt-2">Create a new income or expense entry</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Receipt/Attachment
            </label>
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
              <p className="text-sm text-secondary-600">
                Drop files here or click to upload
              </p>
              <input type="file" className="hidden" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/items')}
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
              Create Transaction
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}