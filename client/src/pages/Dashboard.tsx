import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Pencil, Target, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// CORRECCIÓN 1: Importamos getItemStats en lugar de getUserStats
import { getItemStats, getMonthlySummary } from '../services/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const PIE_CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

interface Item {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsGoal: number;
  goalMet: boolean;
  expenseBudget: number;
  budgetUsagePercentage: number;
}

const SavingsGoalCard: React.FC<{ summary: MonthlySummary, isLoading: boolean }> = ({ summary, isLoading }) => {
  if (isLoading || !summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card flex items-center justify-center"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  const { netSavings, savingsGoal, goalMet } = summary;
  const progress = savingsGoal > 0 ? (netSavings / savingsGoal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card"
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${goalMet ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center mr-4`}>
          <Target className={`w-6 h-6 ${goalMet ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Monthly Savings Goal</h3>
          <p className="text-secondary-600 text-sm">Your progress for this month</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-secondary-700">Net Savings</span>
          <span className="font-bold text-lg text-primary-600">${netSavings.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-secondary-700">Your Goal</span>
          <span className="font-semibold text-secondary-800">${savingsGoal.toLocaleString()}</span>
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-2.5">
          <div 
            className={`${goalMet ? 'bg-green-500' : 'bg-primary-500'}`} 
            style={{ width: `${Math.min(progress, 100)}%`, height: '100%', borderRadius: 'inherit' }}
          />
        </div>

        <div className={`flex items-center justify-center text-sm font-medium ${goalMet ? 'text-green-600' : 'text-red-600'}`}>
          {goalMet ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
          {goalMet ? 'Goal Achieved!' : 'Goal Not Met Yet'}
        </div>
      </div>
    </motion.div>
  );
};

const BudgetStatusCard: React.FC<{ summary: MonthlySummary, isLoading: boolean }> = ({ summary, isLoading }) => {
  if (isLoading || !summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card flex items-center justify-center"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  const { totalExpense, expenseBudget, budgetUsagePercentage } = summary;

  if (expenseBudget <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
            <ShieldAlert className="w-6 h-6 text-secondary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Expense Budget</h3>
            <p className="text-secondary-600 text-sm">No budget set for this month.</p>
          </div>
        </div>
        <Link to="/profile" className="btn btn-sm btn-outline w-full">Set a Budget</Link>
      </motion.div>
    );
  }

  const progressColor = budgetUsagePercentage > 100 ? 'bg-red-500' : budgetUsagePercentage > 80 ? 'bg-yellow-500' : 'bg-primary-500';
  const iconBgColor = budgetUsagePercentage > 100 ? 'bg-red-100' : budgetUsagePercentage > 80 ? 'bg-yellow-100' : 'bg-primary-100';
  const iconColor = budgetUsagePercentage > 100 ? 'text-red-600' : budgetUsagePercentage > 80 ? 'text-yellow-600' : 'text-primary-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card"
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mr-4`}>
          <ShieldAlert className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Expense Budget Status</h3>
          <p className="text-secondary-600 text-sm">Your spending vs budget</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-secondary-700">Spent</span>
          <span className="font-bold text-lg text-primary-600">${totalExpense.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-secondary-700">Budget</span>
          <span className="font-semibold text-secondary-800">${expenseBudget.toLocaleString()}</span>
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-2.5">
          <div 
            className={progressColor}
            style={{ width: `${Math.min(budgetUsagePercentage, 100)}%`, height: '100%', borderRadius: 'inherit' }}
          />
        </div>

        <div className={`flex items-center justify-center text-sm font-medium ${iconColor.replace('text-', 'text-')}`}>
          {budgetUsagePercentage > 100 ? (
            <><XCircle className="w-4 h-4 mr-1" /> Over Budget</>
          ) : (
            <>${(expenseBudget - totalExpense).toLocaleString()} left</>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  // CORRECCIÓN 2: Restauramos la query original que trae los items y stats del año
  const { data: statsData, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['item-stats'], 
    queryFn: () => getItemStats({ year: new Date().getFullYear() })
  });

  // Mantenemos la query nueva para el resumen mensual (presupuestos y metas)
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['monthly-summary'],
    queryFn: getMonthlySummary,
  });

  // CORRECCIÓN 3: Accedemos a la data como en el archivo viejo (statsData.data.data)
  const stats = statsData?.data.data;
  
  // Estas variables ahora sí se llenarán correctamente
  const recentItems = stats?.recentItems || [];
  
  // Este monthlySummary viene de la OTRA llamada (para las cards de presupuesto)
  const monthlySummary = summaryData?.data.summary;

  useEffect(() => {
    if (monthlySummary && monthlySummary.expenseBudget > 0) {
      const { budgetUsagePercentage } = monthlySummary;
      if (budgetUsagePercentage >= 100) {
        toast.error(`You have exceeded your monthly budget of $${monthlySummary.expenseBudget.toLocaleString()}!`, { id: 'budget-exceeded-toast' });
      } else if (budgetUsagePercentage >= 90) {
        toast.warn(`You have used ${budgetUsagePercentage.toFixed(0)}% of your monthly budget.`, { id: 'budget-warning-toast' });
      }
    }
  }, [monthlySummary]);

  if (isLoadingStats || isLoadingSummary) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalIncome = typeof stats?.totalIncome === 'number' ? stats.totalIncome : 0;
  const totalExpense = typeof stats?.totalExpense === 'number' ? stats.totalExpense : 0;
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

      {/* Stat Cards */}
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

      {/* Savings and Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aquí pasamos el monthlySummary que viene de la API de resumen */}
        <SavingsGoalCard summary={monthlySummary} isLoading={isLoadingSummary} />
        <BudgetStatusCard summary={monthlySummary} isLoading={isLoadingSummary} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Income vs Expenses (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* Aquí usamos stats.monthlySummary que viene de getItemStats */}
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.categorySummary || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                paddingAngle={5}
              >
                {(stats?.categorySummary || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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