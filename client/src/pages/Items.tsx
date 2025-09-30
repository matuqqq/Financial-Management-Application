import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getItems, deleteItem } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Item {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: { name: string; } | null;
  date: string;
  notes: string | null;
}

export default function Items() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: itemsData, isLoading } = useQuery<{ data: { items: Item[], total: number } }>({ 
    queryKey: ['items', { search: searchTerm, type: filterType === 'all' ? undefined : filterType }], 
    queryFn: () => getItems({ search: searchTerm, type: filterType === 'all' ? undefined : filterType })
  });
  const items = itemsData?.data.items || [];

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item-stats'] });
      toast.success('Transaction deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Transactions</h1>
          <p className="text-secondary-600 mt-2">Manage your income and expenses</p>
        </div>
        <Link
          to="/items/new"
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button className="btn btn-outline">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 font-medium text-secondary-700">
                  Transaction
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">
                  Date
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-700">
                  Amount
                </th>
                <th className="text-center py-3 px-4 font-medium text-secondary-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-secondary-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          item.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {item.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{item.title}</p>
                          {item.notes && (
                            <p className="text-sm text-secondary-500">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-secondary-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="p-2 text-secondary-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-secondary-600">
          Showing 1 to {items.length} of {itemsData?.data.total || 0} results
        </p>
        <div className="flex space-x-2">
          <button className="btn btn-outline" disabled>
            Previous
          </button>
          <button className="btn btn-primary">1</button>
          <button className="btn btn-outline" disabled>
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}