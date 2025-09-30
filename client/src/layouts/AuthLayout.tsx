import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex">
      {/* Left side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white flex-col justify-center items-center p-12"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DollarSign className="w-16 h-16 mr-4" />
            <h1 className="text-4xl font-bold">FinanceFlow</h1>
          </motion.div>
          <motion.p 
            className="text-xl text-primary-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Take control of your financial future
          </motion.p>
          <motion.div
            className="space-y-4 text-primary-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
              <span>Track your expenses and income</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
              <span>Set and achieve financial goals</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
              <span>Generate insightful reports</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Auth Form */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}