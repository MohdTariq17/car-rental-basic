'use client';
import { Sun, Moon, Car, User, Lock, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setIsDarkMode(shouldUseDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', themeValue);
    document.documentElement.setAttribute('data-theme', themeValue);
  };

  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = 'Email or username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const identifier = formData.identifier.trim();
      const loginData = isEmail(identifier)
        ? { email: identifier, password: formData.password }
        : { username: identifier, password: formData.password };
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
          document.cookie = `authToken=${data.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        }
        if (data.data?.user) localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/pages/dashboard');
      } else {
        setErrors({
          general: data.error || 'Login failed. Please check your credentials.'
        });
      }
    } catch (err) {
      setErrors({ general: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  return (
    <>
      <div className="lux-login-bg">
        <button
          onClick={toggleTheme}
          className="lux-theme-toggle"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
        <div className="lux-login-card">
          <div className="lux-logo-row">
            <span className="lux-logo"><Car size={32}/></span>
            <span className="lux-title">Sign in</span>
          </div>
          <div className="lux-subtitle">Continue to Car Rental</div>
          {errors.general && (
            <div className="lux-error-banner">{errors.general}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="lux-field">
              <label>Email or Username</label>
              <div className="lux-input-group">
                <User className="lux-input-icon"/>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Email or username"
                  autoComplete="username"
                  className={errors.identifier ? 'lux-input error' : 'lux-input'}
                />
              </div>
              {errors.identifier && (
                <span className="lux-field-error">{errors.identifier}</span>
              )}
            </div>
            <div className="lux-field">
              <label>Password</label>
              <div className="lux-input-group">
                <Lock className="lux-input-icon"/>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={errors.password ? 'lux-input error' : 'lux-input'}
                />
                <button
                  type="button"
                  className="lux-eye"
                  aria-label="Toggle password visibility"
                  tabIndex="-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff/> : <Eye/>}
                </button>
              </div>
              {errors.password && (
                <span className="lux-field-error">{errors.password}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="lux-submit"
            >
              {isLoading ? <span className="lux-spinner"></span> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        :global(html) {
          --blue-main: #2563eb;
          --blue-soft: #425cf8;
          --blue-light: #dbeafe;
          --glass: rgba(255,255,255,0.84);
          --glass-dark: rgba(28,33,48,0.87);
          --dark-bg: #151b2f;
          --shadow: 0 8px 44px #2563eb22;
          --error: #d90429;
          --text: #16243a;
          --muted: #8997b0;
        }
        :global([data-theme="dark"]) {
          --blue-main: #2563eb;
          --blue-soft: #5d84f7;
          --blue-light: #232540;
          --glass: rgba(24,26,37,0.96);
          --glass-dark: rgba(13,15,28,0.98);
          --dark-bg: #101323;
          --shadow: 0 8px 36px #0c165c40;
          --error: #ff3265;
          --text: #f7fafc;
          --muted: #babecb;
        }
        .lux-login-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--dark-bg) 0%, var(--blue-soft) 70%, var(--blue-main) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lux-theme-toggle {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: var(--glass);
          color: var(--blue-main);
          border: none;
          border-radius: 11px;
          box-shadow: 0 2px 10px #2563eb18;
          padding: 9px 12px;
          cursor: pointer;
          z-index: 10;
          transition: background 0.18s;
        }
        .lux-theme-toggle:hover { background: var(--blue-light);}
        .lux-login-card {
          max-width: 390px;
          width: 100%;
          background: var(--glass);
          border-radius: 2.3rem;
          box-shadow: var(--shadow);
          border: 1.6px solid var(--blue-light);
          padding: 2.9rem 2.3rem 2.2rem;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          backdrop-filter: blur(12px);
        }
        .lux-logo-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 1.6rem;
        }
        .lux-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--blue-main) 45%, var(--blue-soft) 100%);
          border-radius: 16px;
          width: 56px;
          height: 56px;
          color: #fff;
          box-shadow: 0 2px 18px #2563eb13;
        }
        .lux-title {
          font-size: 2rem;
          font-weight: 700;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          color: var(--blue-main);
          letter-spacing: -1px;
        }
        .lux-subtitle {
          color: var(--muted);
          font-size: 1.08rem;
          margin-bottom: 1.5rem;
          margin-left: 0.5rem;
        }
        .lux-error-banner {
          background: #eff1ff;
          color: var(--error);
          border-radius: 10px;
          padding: 0.99rem 1rem;
          font-size: 1.04rem;
          text-align: center;
          margin-bottom: 1.12rem;
          border: 1px solid var(--error);
        }
        .lux-field {
          margin-bottom: 1.25rem;
        }
        .lux-field label {
          font-weight: 600;
          font-size: 1rem;
          color: var(--blue-main);
          margin-bottom: 0.20rem;
          display: block;
        }
        .lux-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lux-input {
          background: var(--blue-light);
          border: none;
          padding: 1.09rem 1rem 1.09rem 2.75rem;
          border-radius: 999px;
          font-size: 1rem;
          color: var(--text);
          box-shadow: 0 1px 4px #2563eb10 inset;
          width: 100%;
          outline: none;
          border: 2px solid transparent;
          transition: border-color 0.16s, box-shadow 0.18s;
        }
        .lux-input:focus { border-color: var(--blue-main); box-shadow: 0 0 4px var(--blue-soft) inset;}
        .lux-input.error { border: 2px solid var(--error);}
        .lux-input-icon {
          position: absolute;
          left: 1.22rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }
        .lux-eye {
          background: none;
          border: none;
          position: absolute;
          right: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          cursor: pointer;
          padding: 0.1rem;
          display: flex;
          align-items: center;
        }
        .lux-field-error {
          display: block;
          color: var(--error);
          font-size: 0.91rem;
          margin-top: 0.22rem;
          margin-left: 0.92rem;
        }
        .lux-submit {
          width: 100%;
          background: linear-gradient(90deg, var(--blue-soft) 30%, var(--blue-main) 90%);
          color: #fff;
          font-weight: 700;
          font-size: 1.16rem;
          border: none;
          padding: 1.07rem 0;
          border-radius: 999px;
          box-shadow: 0 2px 8px #2563eb13;
          letter-spacing: 0.02em;
          cursor: pointer;
          margin-top: 0.6rem;
          transition: background 0.15s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .lux-submit:active {
          filter: brightness(1.07);
          background: linear-gradient(90deg, var(--blue-main) 67%, var(--blue-soft));
        }
        .lux-submit[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .lux-spinner {
          display: inline-block;
          width: 22px;
          height: 22px;
          border: 2.7px solid var(--blue-light);
          border-top: 2.7px solid var(--blue-main);
          border-radius: 50%;
          animation: spin 0.83s linear infinite;
          margin-right: 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        @media (max-width: 430px) {
          .lux-login-card { padding: 1.13rem 0.8rem;}
          .lux-title { font-size: 1.13rem; }
        }
      `}</style>
    </>
  );
};

export default LoginPage;
// End of src/app/page.js