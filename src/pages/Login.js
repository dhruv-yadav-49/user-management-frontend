import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
        newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
        newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
        return;
        }

        setLoading(true);

        try {
        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Login successful!');
            // Redirect based on role
            if (result.user.role === 'admin') {
            navigate('/admin');
            } else {
            navigate('/profile');
            }
        } else {
            toast.error(result.message || 'Login failed');
            setErrors({ general: result.message });
        }
        } catch (error) {
        toast.error('An error occurred. Please try again.');
        console.error('Login error:', error);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="auth-container">
        <div className="auth-card">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to your account</p>

            <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
                <div className="error-message">{errors.general}</div>
            )}

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                autoComplete="current-password"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
            </form>

            <div className="auth-footer">
            <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                Sign up
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
};

export default Login;