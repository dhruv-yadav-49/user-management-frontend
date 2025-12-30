import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        role: ''
    });
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        action: null,
        userId: null,
        userName: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage, filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
        const params = {
            page: pagination.currentPage,
            limit: pagination.limit,
            ...filters
        };

        const response = await adminAPI.getAllUsers(params);
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Fetch users error:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleActivate = async (userId) => {
        try {
        await adminAPI.activateUser(userId);
        toast.success('User activated successfully');
        fetchUsers();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to activate user');
        }
    };

    const handleDeactivate = async (userId) => {
        try {
        await adminAPI.deactivateUser(userId);
        toast.success('User deactivated successfully');
        fetchUsers();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const handleDelete = async (userId) => {
        try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
        setConfirmDialog({ show: false, action: null, userId: null, userName: '' });
        } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const openConfirmDialog = (action, userId, userName) => {
        setConfirmDialog({
        show: true,
        action,
        userId,
        userName
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
        show: false,
        action: null,
        userId: null,
        userName: ''
        });
    };

    const handleConfirm = () => {
        const { action, userId } = confirmDialog;
        if (action === 'activate') {
        handleActivate(userId);
        } else if (action === 'deactivate') {
        handleDeactivate(userId);
        } else if (action === 'delete') {
        handleDelete(userId);
        }
        closeConfirmDialog();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', role: '' });
    };

    return (
        <div className="admin-dashboard">
        <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Manage all users and their permissions</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
            <div className="filter-group">
            <input
                type="text"
                name="search"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={handleFilterChange}
                className="filter-input"
            />
            </div>

            <div className="filter-group">
            <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            </div>

            <div className="filter-group">
            <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="filter-select"
            >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            </div>

            <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
            </button>
        </div>

        {/* Users Table */}
        {loading ? (
            <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
            </div>
        ) : users.length === 0 ? (
            <div className="empty-state">
            <p>No users found</p>
            </div>
        ) : (
            <>
            <div className="table-container">
                <table className="users-table">
                <thead>
                    <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                    <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                        <span className={`badge badge-${user.role}`}>
                            {user.role}
                        </span>
                        </td>
                        <td>
                        <span className={`badge badge-${user.status}`}>
                            {user.status}
                        </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                        <div className="action-buttons">
                            {user.status === 'active' ? (
                            <button
                                onClick={() => openConfirmDialog('deactivate', user._id, user.fullName)}
                                className="btn btn-warning btn-sm"
                            >
                                Deactivate
                            </button>
                            ) : (
                            <button
                                onClick={() => openConfirmDialog('activate', user._id, user.fullName)}
                                className="btn btn-success btn-sm"
                            >
                                Activate
                            </button>
                            )}
                            <button
                            onClick={() => openConfirmDialog('delete', user._id, user.fullName)}
                            className="btn btn-danger btn-sm"
                            >
                            Delete
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary"
                >
                Previous
                </button>
                <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total users)
                </span>
                <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary"
                >
                Next
                </button>
            </div>
            </>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
            <div className="modal-overlay" onClick={closeConfirmDialog}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Confirm Action</h3>
                <p>
                Are you sure you want to {confirmDialog.action}{' '}
                <strong>{confirmDialog.userName}</strong>?
                </p>
                <div className="modal-actions">
                <button onClick={closeConfirmDialog} className="btn btn-secondary">
                    Cancel
                </button>
                <button onClick={handleConfirm} className="btn btn-danger">
                    Confirm
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default AdminDashboard;