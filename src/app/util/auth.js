
export const logout = async () => {
  try {
    // Call logout API
    const response = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('darkMode'); // Keep dark mode preference
      
      // Redirect to login page
      window.location.href = '/';
      
      return { success: true };
    } else {
      throw new Error(data.error || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API call fails, clear local storage and redirect
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    
    return { success: false, error: error.message };
  }
};
