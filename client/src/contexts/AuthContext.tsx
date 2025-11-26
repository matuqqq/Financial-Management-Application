import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface User {

  id: number;

  email: string;

  name: string;

  role: string;

  savingsGoal?: number;

}



interface AuthContextType {

  user: User | null;

  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (email: string, password: string, name: string) => Promise<void>;

  logout: () => void;

  updateProfile: (data: Partial<User>) => Promise<void>;

  changePassword: (payload: { oldPassword: string; newPassword: string }) => Promise<void>;

  updateSavingsGoal: (payload: { savingsGoal: number }) => Promise<void>;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    checkAuth();

  }, []);



  const checkAuth = async () => {

    try {

      const token = localStorage.getItem('accessToken');

      if (!token) {

        setLoading(false);

        return;

      }



      const response = await api.get('/users/me');

      setUser(response.data.user);

    } catch {

      localStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');

    } finally {

      setLoading(false);

    }

  };



  const login = async (email: string, password: string) => {

    try {

      const response = await api.post('/auth/login', { email, password });

      const { user: userData, accessToken, refreshToken } = response.data;



      localStorage.setItem('accessToken', accessToken);

      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);

      

      toast.success('Welcome back!');

    } catch (error) {

      if (error instanceof AxiosError) {

        const message = error.response?.data?.error?.message || 'Login failed';

        toast.error(message);

      } else {

        toast.error('An unexpected error occurred.');

      }

      throw error;

    }

  };



  const register = async (email: string, password: string, name: string) => {

    try {

      const response = await api.post('/auth/register', { email, password, name });

      const { user: userData, accessToken, refreshToken } = response.data;



      localStorage.setItem('accessToken', accessToken);

      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);

      

      toast.success('Account created successfully!');

    } catch (error) {

      if (error instanceof AxiosError) {

        const message = error.response?.data?.error?.message || 'Registration failed';

        toast.error(message);

      }

      else {

        toast.error('An unexpected error occurred.');

      }

      throw error;

    }

  };



  const logout = async () => {

    try {

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {

        await api.post('/auth/logout', { refreshToken });

      }

    } catch (error) {

      console.error('Logout error:', error);

    } finally {

      localStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');

      setUser(null);

      toast.success('Logged out successfully');

    }

  };



  const updateProfile = async (data: Partial<User>) => {

    try {

      const response = await api.patch('/users/me', data);

      setUser(response.data.user);

      toast.success('Profile updated successfully');

    } catch (error) {

      if (error instanceof AxiosError) {

        const message = error.response?.data?.error?.message || 'Update failed';

        toast.error(message);

      }

      else {

        toast.error('An unexpected error occurred.');

      }

      throw error;

    }

  };



  const changePassword = async (payload: { oldPassword: string; newPassword: string }) => {

    try {

      await api.patch('/users/me/password', payload);

      toast.success('Password updated successfully');

    } catch (error) {

      if (error instanceof AxiosError) {

        const message = error.response?.data?.error?.message || 'Failed to update password';

        toast.error(message);

      }

      else {

        toast.error('An unexpected error occurred.');

      }

      throw error;

    }

  };



  const updateSavingsGoal = async (payload: { savingsGoal: number }) => {

    try {

      const response = await api.patch('/users/me/savings-goal', payload);

      setUser(response.data.user);

      toast.success('Savings goal updated successfully');

    } catch (error) {

      if (error instanceof AxiosError) {

        const message = error.response?.data?.error?.message || 'Failed to update savings goal';

        toast.error(message);

      } else {

        toast.error('An unexpected error occurred.');

      }

      throw error;

    }

  };



  return (

    <AuthContext.Provider value={{

      user,

      loading,

      login,

      register,

      logout,

      updateProfile,

      changePassword,

      updateSavingsGoal,

    }}>

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}