import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import './UserProfile.css';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
        setProfileData({
            fullName: user.fullName || '',
            email: user.email || ''
        });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateProfile = () => {
        const newErrors = {};

        if (!profileData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        } else if (profileData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!profileData.email) {
        newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
        newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
        }

        if (!passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Please confirm new password';
        } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!validateProfile()) {
        return;
        }

        setLoading(true);

        try {
        const response = await userAPI.updateProfile(profileData);
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
        setEditing(false);
        } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
        setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
        return;
        }

        setLoading(true);

        try {
        await userAPI.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        toast.success('Password changed successfully');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });
        setChangingPassword(false);
        } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
        setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setProfileData({
        fullName: user.fullName || '',
        email: user.email || ''
        });
        setErrors({});
        setEditing(false);
    };

    const handleCancelPasswordChange = () => {
        setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
        });
        setErrors({});
        setChangingPassword(false);
    };

    return (
        <div className="profile-container">
        <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
        </div>

        {/* Profile Information */}
        <div className="profile-card">
            <div className="card-header">
            <h2>Profile Information</h2>
            {!editing && (
                <button onClick={() => setEditing(true)} className="btn btn-secondary">
                Edit Profile
                </button>
            )}
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
                <label>Full Name</label>
                <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                disabled={!editing}
                className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
                <label>Email Address</label>
                <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={!editing}
                className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label>Role</label>
                <input
                type="text"
                value={user?.role || ''}
                disabled
                className="disabled-field"
                />
            </div>

            <div className="form-group">
                <label>Status</label>
                <input
                type="text"
                value={user?.status || ''}
                disabled
                className="disabled-field"
                />
            </div>

            {editing && (
                <div className="form-actions">
                <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                </div>
            )}
            </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
            <div className="card-header">
            <h2>Change Password</h2>
            {!changingPassword && (
                <button
                onClick={() => setChangingPassword(true)}
                className="btn btn-secondary"
                >
                Change Password
                </button>
            )}
            </div>

            {changingPassword && (
            <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                <label>Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={errors.currentPassword ? 'error' : ''}
                    placeholder="Enter current password"
                />
                {errors.currentPassword && (
                    <span className="field-error">{errors.currentPassword}</span>
                )}
                </div>

                <div className="form-group">
                <label>New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={errors.newPassword ? 'error' : ''}
                    placeholder="Enter new password"
                />
                {errors.newPassword && (
                    <span className="field-error">{errors.newPassword}</span>
                )}
                <small className="field-hint">
                    Must contain uppercase, lowercase, and number
                </small>
                </div>

                <div className="form-group">
                <label>Confirm New Password</label>
                <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={errors.confirmNewPassword ? 'error' : ''}
                    placeholder="Confirm new password"
                />
                {errors.confirmNewPassword && (
                    <span className="field-error">{errors.confirmNewPassword}</span>
                )}
                </div>

                <div className="form-actions">
                <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
                </div>
            </form>
            )}
        </div>

        {/* Account Details */}
        <div className="profile-card">
            <h2>Account Details</h2>
            <div className="account-details">
            <div className="detail-row">
                <span className="detail-label">Account Created:</span>
                <span className="detail-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
            </div>
            <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
            </div>
            <div className="detail-row">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </span>
            </div>
            </div>
        </div>
        </div>
    );
};

export default UserProfile;