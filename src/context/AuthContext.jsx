import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await authAPI.verifyOTP({ email, otp });
    return data;
  };

  const resendOTP = async (email) => {
    const { data } = await authAPI.resendOTP({ email });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await authAPI.updateProfile(profileData);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const isStaff = isAdmin || isEditor;
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        verifyOTP,
        resendOTP,
        login,
        logout,
        updateProfile,
        refreshUser,
        isAdmin,
        isEditor,
        isStaff,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};