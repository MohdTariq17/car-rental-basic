"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Moon, Sun, Car } from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedDarkMode !== null ? savedDarkMode : systemPrefersDark;
    
    setIsDarkMode(shouldUseDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Enhanced validation
  const validateForm = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError("");
    return true;
  };

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

// Dynamic styles based on dark mode
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
    justifyContent: "center",
    background: isDarkMode 
      ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
    padding: "1rem",
    position: "relative",
    overflow: "hidden"
  };

  const backgroundElements = isDarkMode ? (
    <>
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
    </>
  ) : (
    <>
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
    </>
  );

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    width: "380px",
    maxWidth: "90vw",
    padding: "2.5rem",
    border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    borderRadius: "16px",
    background: isDarkMode 
      ? "rgba(31, 41, 55, 0.8)"
      : "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    boxShadow: isDarkMode
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)",
    position: "relative"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "1rem"
  };

  const iconContainerStyle = {
    width: "64px",
    height: "64px",
    background: isDarkMode
      ? "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)"
      : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem auto",
    boxShadow: isDarkMode
      ? "0 10px 25px -3px rgba(0, 0, 0, 0.3)"
      : "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
  };

  const titleStyle = {
    color: isDarkMode ? "#f9fafb" : "#1f2937",
    fontSize: "1.75rem",
    fontWeight: "300",
    margin: "0 0 0.5rem 0",
    letterSpacing: "0.025em"
  };

  const subtitleStyle = {
    color: isDarkMode ? "#9ca3af" : "#6b7280",
    fontSize: "0.875rem",
    fontWeight: "300",
    margin: "0"
  };

  const inputContainerStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  };

  const labelStyle = {
    color: isDarkMode ? "#d1d5db" : "#374151",
    fontSize: "0.875rem",
    fontWeight: "500",
    marginBottom: "0.5rem"
  };

  const inputStyle = {
    padding: "1rem 1rem 1rem 1rem",
    borderRadius: "12px",
    border: isDarkMode ? "1px solid #4b5563" : "1px solid #d1d5db",
    background: isDarkMode 
      ? "rgba(55, 65, 81, 0.5)" 
      : "rgba(255, 255, 255, 0.7)",
    color: isDarkMode ? "#f9fafb" : "#1f2937",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    outline: "none",
    backdropFilter: "blur(10px)"
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: "3rem"
  };

  const toggleButtonStyle = {
    position: "absolute",
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: isDarkMode ? "#9ca3af" : "#6b7280",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "4px",
    transition: "color 0.2s ease"
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "0.875rem",
    padding: "0.75rem",
    background: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    margin: "0"
  };

  const buttonStyle = {
    padding: "1rem",
    borderRadius: "12px",
    border: "none",
    background: isDarkMode
      ? "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)"
      : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
    color: isDarkMode ? "#1f2937" : "#f9fafb",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: isDarkMode
      ? "0 4px 14px 0 rgba(0, 0, 0, 0.2)"
      : "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
    opacity: isLoading ? 0.7 : 1,
    transform: isLoading ? "scale(1)" : "scale(1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem"
  };

  const darkModeToggleStyle = {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    background: isDarkMode 
      ? "rgba(55, 65, 81, 0.8)" 
      : "rgba(255, 255, 255, 0.8)",
    border: isDarkMode ? "1px solid #4b5563" : "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "0.75rem",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
    zIndex: 10
  };

  const footerStyle = {
    textAlign: "center",
    marginTop: "1.5rem"
  };

  const footerTextStyle = {
    color: isDarkMode ? "#6b7280" : "#9ca3af",
    fontSize: "0.75rem",
    fontWeight: "300",
    margin: "0"
  };

  return (
    <div style={containerStyle}>
      {backgroundElements}
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        style={darkModeToggleStyle}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        {isDarkMode ? (
          <Sun style={{ width: "20px", height: "20px", color: "#fbbf24" }} />
        ) : (
          <Moon style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        )}
      </button>

      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <Car style={{ 
              width: "32px", 
              height: "32px", 
              color: isDarkMode ? "#1f2937" : "#f9fafb" 
            }} />
          </div>
          <h2 style={titleStyle}>Welcome back</h2>
          <p style={subtitleStyle}>Sign in to your account</p>
        </div>

        {/* Email Input */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            style={inputStyle}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = isDarkMode ? "#60a5fa" : "#3b82f6";
              e.target.style.boxShadow = isDarkMode 
                ? "0 0 0 3px rgba(96, 165, 250, 0.1)"
                : "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isDarkMode ? "#4b5563" : "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Password Input */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              style={passwordInputStyle}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = isDarkMode ? "#60a5fa" : "#3b82f6";
                e.target.style.boxShadow = isDarkMode 
                  ? "0 0 0 3px rgba(96, 165, 250, 0.1)"
                  : "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkMode ? "#4b5563" : "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.color = isDarkMode ? "#d1d5db" : "#374151";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = isDarkMode ? "#9ca3af" : "#6b7280";
              }}
            >
              {showPassword ? (
                <EyeOff style={{ width: "20px", height: "20px" }} />
              ) : (
                <Eye style={{ width: "20px", height: "20px" }} />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <div style={errorStyle}>{error}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = "scale(1.02)";
              e.target.style.boxShadow = isDarkMode
                ? "0 8px 25px 0 rgba(0, 0, 0, 0.3)"
                : "0 8px 25px 0 rgba(0, 0, 0, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = isDarkMode
                ? "0 4px 14px 0 rgba(0, 0, 0, 0.2)"
                : "0 4px 14px 0 rgba(0, 0, 0, 0.1)";
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: "20px",
                height: "20px",
                border: `2px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                borderTop: `2px solid ${isDarkMode ? "#1f2937" : "#f9fafb"}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>Premium car rental experience</p>
        </div>
      </form>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
