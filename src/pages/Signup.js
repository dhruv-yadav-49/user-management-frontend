import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        // Full name validation
        if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email) {
        newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
        newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
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
        const result = await signup(
            formData.fullName,
            formData.email,
            formData.password
        );

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/profile');
        } else {
            toast.error(result.message || 'Signup failed');
            setErrors({ general: result.message });
        }
        } catch (error) {
        toast.error('An error occurred. Please try again.');
        console.error('Signup error:', error);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="auth-container">
        <div className="auth-card">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Sign up to get started</p>

            <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
                <div className="error-message">{errors.general}</div>
            )}

            <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'error' : ''}
                placeholder="Enter your full name"
                autoComplete="name"
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
                <small className="field-hint">
                Must contain uppercase, lowercase, and number
                </small>
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                autoComplete="new-password"
                />
                {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
                )}
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
            >
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            </form>

            <div className="auth-footer">
            <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                Login
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
};

export default Signup;