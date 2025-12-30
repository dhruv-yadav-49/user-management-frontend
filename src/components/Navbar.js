import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
        <div className="navbar-container">
            <Link to="/" className="navbar-logo">
            User Management
            </Link>

            <div className="navbar-menu">
            {user && (
                <>
                <div className="navbar-user-info">
                    <span className="user-name">{user.fullName}</span>
                    <span className={`user-role ${user.role}`}>{user.role}</span>
                </div>

                {isAdmin && (
                    <Link to="/admin" className="nav-link">
                    Dashboard
                    </Link>
                )}

                <Link to="/profile" className="nav-link">
                    Profile
                </Link>

                <button onClick={handleLogout} className="btn btn-logout">
                    Logout
                </button>
                </>
            )}
            </div>
        </div>
        </nav>
    );
};

export default Navbar;