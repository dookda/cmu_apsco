import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLoginButton } from '../components/auth';
import './LoginPage.css';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleLoginError = (error) => {
    console.error('Login failed:', error);
    alert('Login failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>CMU APSCO</h1>
            <p>Agricultural Production System and Climate Observatory</p>
          </div>

          <div className="login-content">
            <h2>Sign in to continue</h2>
            <p className="login-description">
              Use your Google account to access the dashboard
            </p>

            <div className="login-button-container">
              <GoogleLoginButton
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
            </div>
          </div>

          <div className="login-footer">
            <p>&copy; 2024 Chiang Mai University. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
