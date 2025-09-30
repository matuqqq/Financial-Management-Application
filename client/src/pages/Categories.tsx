import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getCategories, createCategory, deleteCategory } from '../services/api';

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{ data: { categories: Category[] } }>({ 
    queryKey: ['categories'], 
    queryFn: getCategories 
  });
  const categories = categoriesData?.data.categories || [];

  const createCategoryMutation = useMutation({
    mutationFn: () => createCategory(newCategoryName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
      setNewCategoryName('');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    createCategoryMutation.mutate();
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    deleteCategoryMutation.mutate(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900">Manage Categories</h1>
        <p className="text-secondary-600 mt-2">Organize your income and expense categories</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card h-fit"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Add New Category</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-secondary-700 mb-2">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input"
                placeholder="e.g., Groceries"
                disabled={createCategoryMutation.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="w-full btn btn-primary"
            >
              {createCategoryMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Category
            </button>
          </form>
        </motion.div>

        {/* Category List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Categories</h2>
          <div className="space-y-3">
            {isLoadingCategories ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : categories.length > 0 ? (
              categories.map(category => (
                <div key={category.id} className="flex items-center justify-between bg-secondary-50 p-3 rounded-lg">
                  <span className="text-secondary-800">{category.name}</span>
                  <div className="flex space-x-2">
                    <button className="p-1 text-secondary-500 hover:text-primary-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deleteCategoryMutation.isPending}
                      className="p-1 text-secondary-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary-500 text-center py-4">No categories found. Add one to get started!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
