/**
 * Navigation Component
 * 
 * Professional navigation bar with glass morphism effect
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  History, 
  Settings, 
  User, 
  Menu, 
  X,
  Home,
  FileText,
  Shield,
  LogIn,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logout, isAdmin } from '@/lib/auth';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    ...(user ? [
      { href: '/diagnosis', label: 'Diagnosis', icon: Activity },
      { href: '/history', label: 'History', icon: History },
    ] : []),
    { href: '/about', label: 'About', icon: FileText },
    ...(user && isAdmin() ? [{ href: '/admin/dashboard', label: 'Admin', icon: Shield }] : []),
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600 pulse-medical" />
              <div className="absolute -inset-1 bg-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MedNex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive(href)
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold text-blue-600">{user.full_name}</span>
                  {user.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                      ADMIN
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 glass-card mt-2 rounded-lg">
            <div className="flex flex-col space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Welcome, <span className="font-semibold text-blue-600">{user.full_name}</span>
                      {user.role === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="font-medium">User Login</span>
                    </Link>
                    <Link
                      href="/admin/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Admin Login</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medical Disclaimer Bar */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-sm text-yellow-800">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Educational Tool Only</span>
          <span className="text-yellow-600">•</span>
          <span>Always consult healthcare professionals for medical advice</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
