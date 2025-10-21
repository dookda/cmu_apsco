import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <a
        className="pc-head-link dropdown-toggle arrow-none me-0"
        data-bs-toggle="dropdown"
        href="#"
        role="button"
        aria-haspopup="false"
        aria-expanded="false"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="user-avtar"
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4285f4',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              textTransform: 'uppercase'
            }}
          >
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
        )}
      </a>
      <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
        <div className="dropdown-header">
          <h6 className="mb-1">{user?.name || 'User'}</h6>
          <small className="text-muted">{user?.email}</small>
        </div>
        <div className="dropdown-divider"></div>
        <a href="#!" className="dropdown-item" onClick={(e) => { e.preventDefault(); logout(); }}>
          <i className="ph-duotone ph-sign-out"></i>
          <span>{t('logout')}</span>
        </a>
      </div>
    </>
  );
};

export default UserProfile;
