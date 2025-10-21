import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const GoogleAuthButton = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const buttonRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (!document.getElementById('google-signin-script')) {
        const script = document.createElement('script');
        script.id = 'google-signin-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
          initializeGoogleButton();
        };
      } else if (window.google && !isInitialized.current) {
        initializeGoogleButton();
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await login(response.credential);
      if (!result.success) {
        console.error('Login failed:', result.error);
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const initializeGoogleButton = () => {
    if (window.google && buttonRef.current && !isInitialized.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          // theme: 'filled_blue',
          size: 'medium',
          text: 'signin',
          shape: 'rectangular',
          width: 100,
        }
      );

      isInitialized.current = true;
    }
  };

  return (
    <div
      ref={buttonRef}
      style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}
    />
  );
};

export default GoogleAuthButton;
