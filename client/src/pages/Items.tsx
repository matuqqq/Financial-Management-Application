import { useState, useEffect } from 'react'; // Importar useEffect
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

// Definimos la estructura de la respuesta de la API (con el doble 'data' y 'meta')
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
    };
  };
}

export default function Items() {
  const queryClient = useQueryClient();
  
  // Estados para los filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10; // Definir un límite por página

  // Efecto para el debounce del buscador
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Resetear a la página 1 al buscar
    }, 500); // 500ms de retraso

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: itemsData, isLoading } = useQuery<ItemsApiResponse>({ 
    queryKey: [
      'items', 
      { 
        search: debouncedSearch, // Usar el término con debounce
        type: filterType === 'all' ? undefined : filterType,
        page,
        limit
      }
    ], 
    queryFn: () => getItems({ 
      search: debouncedSearch,
      type: filterType === 'all' ? undefined : filterType,
      page,
      limit
    }),
    keepPreviousData: true // Mantiene los datos anteriores mientras carga los nuevos
  });

  // Acceder a los datos con la estructura anidada correcta
  const items = itemsData?.data?.data?.items || [];
  const meta = itemsData?.data?.data?.meta;

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      // Invalidar queries de 'items' y 'item-stats' para refrescar
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

  // Manejador para el cambio de filtro de tipo
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setPage(1); // Resetear a la página 1
  };

  // Variables de paginación
  const totalPages = meta?.totalPages || 1;
  const currentPage = meta?.page || 1;
  const totalResults = meta?.total || 0;

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
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
              onChange={handleFilterChange} // Usar el nuevo manejador
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
          Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalResults)} of {totalResults} results
        </p>
        <div className="flex space-x-2">
          <button 
            className="btn btn-outline" 
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </button>
          <span className="btn btn-primary pointer-events-none">
            {currentPage}
          </span>
          <button 
            className="btn btn-outline" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}