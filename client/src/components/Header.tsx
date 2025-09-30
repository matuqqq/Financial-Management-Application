import { Menu, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <motion.header 
      className="bg-white border-b border-secondary-200 px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-secondary-900 ml-2 lg:ml-0">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-6 h-6 text-secondary-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>
          
          <div className="relative group">
            <motion.button 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-6 h-6 text-secondary-600" />
              <span className="hidden md:block text-sm text-secondary-700">
                {user?.name}
              </span>
            </motion.button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <a href="/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                  Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                  Settings
                </a>
                <hr className="my-1" />
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}