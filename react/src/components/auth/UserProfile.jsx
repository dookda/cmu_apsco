import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="user-profile">
      <div
        className="user-avatar-container"
        onClick={() => setShowMenu(!showMenu)}
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
        )}
      </div>

      {showMenu && (
        <div className="user-menu">
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
