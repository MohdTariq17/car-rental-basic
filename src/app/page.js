'use client';
import { Sun, Moon, Car, User, Lock, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setIsDarkMode(shouldUseDark);
    
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', themeValue);
    document.documentElement.setAttribute('data-theme', themeValue);
  };

  // Detect if input is email or username
  const isEmail = (input) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
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
      const identifier = formData.identifier.trim();
      
      // Prepare login data based on whether it's email or username
      const loginData = isEmail(identifier) 
        ? { email: identifier, password: formData.password }
        : { username: identifier, password: formData.password };

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
          document.cookie = `authToken=${data.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        }
        
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // Redirect to dashboard
        router.push('/pages/dashboard');
      } else {
        setErrors({
          general: data.error || 'Login failed. Please check your credentials.'
        });
      }
    } catch (err) {
      setErrors({
        general: 'Connection error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
        general: undefined
      }));
    }
  };

  return (
    <>
      <div className="container">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Login Card */}
        <div className="card">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <Car size={28} />
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="form">
            {/* Email/Username Field */}
            <div className="field">
              <label htmlFor="identifier">Email or Username</label>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Enter email or username"
                  className={errors.identifier ? 'error' : ''}
                  autoComplete="username"
                />
              </div>
              {errors.identifier && (
                <span className="field-error">{errors.identifier}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        :global(html) {
          --bg: #ffffff;
          --surface: #f8fafc;
          --text: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --accent: #2563eb;
          --accent-hover: #1d4ed8;
          --error: #dc2626;
          --error-bg: #fef2f2;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        :global([data-theme="dark"]) {
          --bg: #0f172a;
          --surface: #1e293b;
          --text: #f1f5f9;
          --text-muted: #94a3b8;
          --border: #334155;
          --accent: #3b82f6;
          --accent-hover: #2563eb;
          --error: #ef4444;
          --error-bg: #1e293b;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        :global(*) {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :global(body) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.5;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%);
        }

        .theme-toggle {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow);
          z-index: 10;
        }

        .theme-toggle:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-lg);
        }

        .card {
          width: 100%;
          max-width: 380px;
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          width: 56px;
          height: 56px;
          background: var(--accent);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
        }

        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text);
        }

        .header p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .error-banner {
          background: var(--error-bg);
          color: var(--error);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--error);
        }

                .form {
                  display: flex;
                  flex-direction: column;
                  gap: 1.5rem;
                }
              `}</style>
            </>
          );
        };
        
        export default LoginPage;