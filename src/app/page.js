'use client';
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Car, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedDarkMode !== null ? savedDarkMode : systemPrefersDark;
    setIsDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      console.log('Attempting login with:', { email: formData.email.trim() });
      
      const response = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      // Get response text first to check if it's empty
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('Server returned empty response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      console.log('Parsed response data:', data);

      if (response.ok && data.statusCode === 200) {
        console.log('Login successful');
        // Store token in localStorage as backup
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
        }
        window.location.href = '/pages/dashboard';
      } else {
        console.error('Login failed:', data);
        setErrors({
          general: data.message || `Login failed: ${response.status}`
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({
        general: `Network error: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-950 dark:to-black flex items-center justify-center p-4 transition-colors duration-300">
      {/* Dark mode toggle button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-gray-200/60 dark:border-slate-600/60 shadow-lg dark:shadow-2xl hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 hover:scale-105 z-10 group"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors duration-200" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 group-hover:text-gray-700 transition-colors duration-200" />
        )}
      </button>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-600/30 dark:to-purple-800/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-600/20 dark:from-emerald-600/30 dark:to-blue-800/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-pink-500/10 dark:from-violet-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Login form */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl dark:shadow-slate-950/50 border border-white/30 dark:border-slate-600/40 p-8 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-100 dark:to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-slate-900/50 transition-all duration-300 hover:scale-105">
              <Car className="w-8 h-8 text-white dark:text-slate-900 transition-colors duration-300" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-slate-100 mb-2 tracking-wide transition-colors duration-300">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-light transition-colors duration-300">
              Sign in to your account
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50/90 dark:bg-red-950/50 border-l-4 border-red-400 dark:border-red-500 rounded-r-lg backdrop-blur-sm">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors duration-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 pl-12 bg-white/70 dark:bg-slate-700/70 border ${
                    errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-200/60 dark:border-slate-600/60'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-300 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80`}
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 transition-colors duration-300" />
              </div>
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 pl-12 pr-12 bg-white/70 dark:bg-slate-700/70 border ${
                    errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-200/60 dark:border-slate-600/60'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-300 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80`}
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 transition-colors duration-300" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-100 dark:to-gray-100 text-white dark:text-slate-900 font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 dark:hover:from-slate-50 dark:hover:to-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-300 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 shadow-lg dark:shadow-slate-900/50 hover:shadow-xl dark:hover:shadow-slate-900/70 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-slate-400 text-sm transition-colors duration-300">
              Don't have an account?{' '}
              <a href="/register" className="text-gray-900 dark:text-slate-200 font-medium hover:underline hover:text-gray-700 dark:hover:text-slate-100 transition-colors duration-200">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
