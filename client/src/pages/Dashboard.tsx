import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Pencil } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getItemStats } from '../services/api'; // Eliminamos getItems ya que no se usa aquí
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const PIE_CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

interface Item {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export default function Dashboard() {
  // Solo necesitamos una query, ya que getItemStats ahora devuelve todo
  const { data: statsData, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['item-stats'], 
    queryFn: () => getItemStats({ year: new Date().getFullYear() })
  });

  // Eliminamos la query para getItems, ya que statsData lo incluirá

  const stats = statsData?.data.data;
  // Obtenemos recentItems directamente de la respuesta de stats
  const recentItems = stats?.recentItems || [];

  console.log(recentItems);

  // Simplificamos el estado de carga
  if (isLoadingStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalIncome = typeof stats?.totalIncome === 'number' ? stats.totalIncome : 0;
  const totalExpense = typeof stats?.totalExpense === 'number' ? stats.totalExpense : 0;
  // Usamos el netSavings calculado por el backend
  const netSavings = typeof stats?.netSavings === 'number' ? stats.netSavings : 0;
  
  const statCards = [
    {
      name: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      name: 'Total Expenses',
      value: `$${totalExpense.toLocaleString()}`,
      icon: TrendingDown,
    },
    {
      name: 'Net Savings',
      value: `$${netSavings.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      name: 'Transactions',
      value: stats?.totalTransactions || '0',
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Welcome back! Here's your financial overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.monthlySummary || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Expense Categories
          </h3>
          <div className="flex">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={stats?.categorySummary || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {(stats?.categorySummary || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(stats?.categorySummary || []).map((category: any, index: number) => (
                <div key={category.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-secondary-600">
                    {category.name}
                  </span>
                  <span className="ml-auto text-sm font-medium text-secondary-900">
                    ${category.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900">
            Recent Transactions
          </h3>
          <a href="/items" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
            View all
          </a>
        </div>
        <div className="space-y-4">
          {recentItems.map((transaction : any, index : any) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <div>
                <p className="font-medium text-secondary-900">{transaction.title}</p>
                <p className="text-sm text-secondary-500">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <p className={`font-semibold mr-4 ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <Link to={`/items/${transaction.id}`} className="text-secondary-500 hover:text-primary-600">
                  <Pencil size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}