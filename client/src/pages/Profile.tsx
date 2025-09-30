import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Mail, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
    } catch {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Updating password with:', data);
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900">Profile</h1>
        <p className="text-secondary-600 mt-2">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Profile Information</h2>
              <p className="text-secondary-600 text-sm">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name
              </label>
              <input
                {...profileForm.register('name')}
                type="text"
                className="input"
                placeholder="Enter your full name"
              />
              {profileForm.formState.errors.name && (
                <p className="form-error">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  {...profileForm.register('email')}
                  type="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {profileForm.formState.errors.email && (
                <p className="form-error">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Change Password</h2>
              <p className="text-secondary-600 text-sm">Update your account password</p>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                Current Password
              </label>
              <input
                {...passwordForm.register('oldPassword')}
                type="password"
                className="input"
                placeholder="Enter current password"
              />
              {passwordForm.formState.errors.oldPassword && (
                <p className="form-error">{passwordForm.formState.errors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                New Password
              </label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                className="input"
                placeholder="Enter new password"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="form-error">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm New Password
              </label>
              <input
                {...passwordForm.register('confirmPassword')}
                type="password"
                className="input"
                placeholder="Confirm new password"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="form-error">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPasswordLoading}
              className="w-full btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isPasswordLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Update Password
            </button>
          </form>
        </motion.div>
      </div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-500 mb-1">
              Account Status
            </label>
            <p className="text-secondary-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-500 mb-1">
              Member Since
            </label>
            <p className="text-secondary-900">January 2025</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-500 mb-1">
              Role
            </label>
            <p className="text-secondary-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}