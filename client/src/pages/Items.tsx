import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, Calendar, Paperclip } from 'lucide-react';
import { getItems, deleteItem, getCategories } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Item {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: { name: string } | null;
  date: string;
  notes: string | null;
  attachmentUrl?: string | null;
  paymentMethod: 'cash' | 'debit' | 'credit';
}

const PAYMENT_METHOD_LABELS: Record<Item['paymentMethod'], string> = {
  cash: 'Cash',
  debit: 'Debit',
  credit: 'Credit',
};

interface Totals {
  income: number;
  expense: number;
}

interface ItemsApiResponse {
  data: {
    data: {
      items: Item[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      totals: Totals;
    };
  };
}

export default function Items() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [filterType, setFilterType] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: itemsData, isLoading } = useQuery<ItemsApiResponse>({
    queryKey: [
      'items',
      {
        search: debouncedSearch,
        type: filterType === 'all' ? undefined : filterType,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        paymentMethod: paymentFilter === 'all' ? undefined : paymentFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit,
      },
    ],
    queryFn: () =>
      getItems({
        search: debouncedSearch,
        type: filterType === 'all' ? undefined : filterType,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        paymentMethod: paymentFilter === 'all' ? undefined : paymentFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
  });

  const items = itemsData?.data?.data?.items || [];
  const meta = itemsData?.data?.data?.meta;
  const totals = itemsData?.data?.data?.totals || { income: 0, expense: 0 };
  const categories = categoriesData?.data?.categories || [];

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item-stats'] });
      toast.success('Transaction deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const totalPages = meta?.totalPages || 1;
  const currentPage = meta?.page || 1;
  const totalResults = meta?.total || 0;

  const paymentTotals = items.reduce(
    (acc, item) => {
      const amount = Math.abs(item.amount);
      acc.general += amount;
      if (item.paymentMethod === 'cash') {
        acc.cash += amount;
      } else {
        acc.other += amount;
      }
      return acc;
    },
    { general: 0, cash: 0, other: 0 }
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Transactions</h1>
          <p className="text-secondary-600 mt-2">Manage your income and expenses</p>
        </div>

        <Link to="/items/new" className="btn btn-primary w-full md:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Search + filters */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Type / Category */}
            <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
              <div className="flex-1 w-full">

                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                  className="input w-full"
                  aria-label="Filter by transaction type"
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="flex-1 w-full">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="input w-full"
                  aria-label="Filter by category"
                >
                  <option value="all">All</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <div>
              <label className="block text-xs uppercase font-semibold text-secondary-500">
                From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="input pl-9 w-full"
                  aria-label="Filter from date"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-secondary-500">
                To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="input pl-9 w-full"
                  aria-label="Filter to date"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setFromDate('');
                  setToDate('');
                  setFilterType('all');
                  setPaymentFilter('all');
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setPage(1);
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {/* Payment Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
            <div className="p-4 border rounded-lg bg-secondary-50">
              <p className="text-xs uppercase font-semibold text-secondary-500">Total General</p>
              <p className="text-xl font-bold text-secondary-900 mt-1">
                {formatCurrency(paymentTotals.general)}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary-50">
              <p className="text-xs uppercase font-semibold text-secondary-500">Subtotal Cash</p>
              <p className="text-xl font-bold text-secondary-900 mt-1">
                {formatCurrency(paymentTotals.cash)}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary-50">
              <p className="text-xs uppercase font-semibold text-secondary-500">Subtotal Other Methods</p>
              <p className="text-xl font-bold text-secondary-900 mt-1">
                {formatCurrency(paymentTotals.other)}
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Totals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Income */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-secondary-500 text-sm uppercase font-semibold">Total Income</p>
            <p className="text-3xl font-bold text-green-600 mt-2">${totals.income.toFixed(2)}</p>
          </div>

          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
        </div>

        {/* Expense */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-secondary-500 text-sm uppercase font-semibold">Total Expense</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${totals.expense.toFixed(2)}</p>
          </div>

          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <TrendingDown className="w-7 h-7 text-red-600" />
          </div>
        </div>
      </motion.div>

      {/* Transactions table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full"
      >
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4">Transaction</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-secondary-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b hover:bg-secondary-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            item.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {item.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.notes && <p className="text-sm text-secondary-500">{item.notes}</p>}
                        <p className="text-xs text-secondary-500">
                          {PAYMENT_METHOD_LABELS[item.paymentMethod]}
                        </p>
                          {item.attachmentUrl && (
                            <a
                              href={item.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary-600 mt-1"
                            >
                              <Paperclip className="w-3 h-3" />
                              Receipt
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="bg-secondary-100 px-2.5 py-1 rounded-full text-xs">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-secondary-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td
                      className={`py-4 px-4 text-right font-semibold ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-2 text-secondary-400 hover:text-primary-600"
                          aria-label={`View transaction ${item.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="p-2 text-secondary-400 hover:text-red-600"
                          aria-label={`Delete transaction ${item.title}`}
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
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p className="text-sm text-secondary-600 text-center sm:text-left">
          Showing {(currentPage - 1) * limit + 1} to{' '}
          {Math.min(currentPage * limit, totalResults)} of {totalResults} results
        </p>

        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <button
            className="btn btn-outline w-full sm:w-auto"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>

          <span className="btn btn-primary pointer-events-none">{currentPage}</span>

          <button
            className="btn btn-outline w-full sm:w-auto"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}
