import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                
                // Verify token is still valid
                try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (error) {
            console.error('Token verification failed:', error);
            logout();
            }
        }
        setLoading(false);
    };

    loadUser();
    }, []);

    const login = async (email, password) => {
    try {
        const response = await authAPI.login({ email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);

        return { success: true, user };
        } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        return { success: false, message };
        }
    };

    const signup = async (fullName, email, password) => {
    try {
        const response = await authAPI.signup({ fullName, email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);

        return { success: true, user };
        } catch (error) {
        const message = error.response?.data?.message || 'Signup failed';
        return { success: false, message };
        }
    };

    const logout = async () => {
        try {
        await authAPI.logout();
        } catch (error) {
        console.error('Logout error:', error);
        } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        }
    };

        const updateUser = (updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        };

    const isAdmin = user?.role === 'admin';
    const isAuthenticated = !!token && !!user;

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};