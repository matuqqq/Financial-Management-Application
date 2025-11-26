import { useRef, useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getCategories, createItem, uploadReceipt } from '../services/api';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  paymentMethod: z.enum(['cash', 'debit', 'credit']),
  categoryId: z.coerce.number().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().min(1, 'Notes are required'),
}).refine((data) => {
  if (data.type === 'income' && data.paymentMethod === 'credit') {
    return false;
  }
  return true;
}, {
  message: "Income cannot be recorded with credit card payment",
  path: ["paymentMethod"],
});

type ItemFormData = z.infer<typeof itemSchema>;

interface Category {
  id: number;
  name: string;
}

export default function CreateItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [receipt, setReceipt] = useState<{ url: string; name: string } | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const { data: categoriesData } = useQuery<{ data: { categories: Category[] } }>({ 
    queryKey: ['categories'], 
    queryFn: getCategories 
  });
  const categories = categoriesData?.data.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      type: 'expense',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const transactionType = watch('type');
  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    // If transaction type changes to 'income' and payment method is 'credit', reset to 'cash'
    if (transactionType === 'income' && paymentMethod === 'credit') {
      setValue('paymentMethod', 'cash');
    }
  }, [transactionType, paymentMethod, setValue]);

  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item-stats'] });
      toast.success('Transaction created successfully!');
      navigate('/items');
    },
    onError: () => {
      toast.error('Failed to create transaction');
    },
  });

  const normalizeDateForApi = (date: string) => {
    return new Date(`${date}T00:00:00`).toISOString();
  };

  const handleReceiptChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    try {
      const response = await uploadReceipt(file);
      const uploaded = response.data.file;
      setReceipt({
        url: uploaded.url,
        name: uploaded.originalname,
      });
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload receipt');
    } finally {
      setIsUploadingReceipt(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    toast.success('Attachment removed');
  };

  const onSubmit = (data: ItemFormData) => {
    const payload = {
      ...data,
      date: normalizeDateForApi(data.date),
      attachmentUrl: receipt?.url,
    };
    createItemMutation.mutate(payload);
  };

  const availablePaymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' },
  ].filter(method => !(transactionType === 'income' && method.value === 'credit'));

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
          aria-label="Back to transactions"
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

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availablePaymentMethods.map((method) => (
                <label
                  key={method.value}
                  className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value={method.value}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <span className="text-sm text-secondary-700">{method.label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="form-error">{errors.paymentMethod.message}</p>
            )}
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
              Notes *
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
            <label htmlFor="receiptUpload" className="block text-sm font-medium text-secondary-700 mb-2">
              Receipt/Attachment
            </label>
            <input
              id="receiptUpload"
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
              disabled={isUploadingReceipt}
            >
              {isUploadingReceipt ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span className="text-sm text-secondary-600">Uploading receipt...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">
                    {receipt ? 'Replace uploaded file' : 'Drop files here or click to upload'}
                  </p>
                </>
              )}
            </button>
            {receipt && (
              <div className="mt-3 flex items-center justify-between bg-secondary-50 p-3 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-800">{receipt.name}</p>
                  <a
                    href={receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 underline"
                  >
                    View attachment
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="text-xs text-secondary-500 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
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
              disabled={createItemMutation.isPending || isUploadingReceipt}
              className="flex-1 btn btn-primary"
            >
              {createItemMutation.isPending ? (
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