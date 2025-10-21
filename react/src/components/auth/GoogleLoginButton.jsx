import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './GoogleLoginButton.css';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await login(response.credential);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(result.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (onError) onError(error.message);
    }
  };

  return <div id="google-signin-button"></div>;
};

export default GoogleLoginButton;
