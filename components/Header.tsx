
import React, { useEffect, useRef } from 'react';
import { RssIcon } from './IconComponents';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLogin: (response: any) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
  const googleSignInButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGsi = () => {
      if (window.google && googleSignInButton.current) {
        const clientId = document.querySelector('meta[name="google-signin-client_id"]')?.getAttribute('content');
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" || clientId === "%VITE_GOOGLE_CLIENT_ID%") {
          console.error("Google Client ID is not configured. Please update index.html or set VITE_GOOGLE_CLIENT_ID in your environment.");
          if (googleSignInButton.current) {
            googleSignInButton.current.innerHTML = '<div class="text-error text-xs">Google Client ID 未設定</div>';
          }
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onLogin,
        });

        window.google.accounts.id.renderButton(
          googleSignInButton.current,
          { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' }
        );
      }
    };
    
    // Ensure the GSI script has loaded before initializing
    if (!user) {
      if (window.google?.accounts?.id) {
        initializeGsi();
      } else {
        // Fallback for slower script loading
        const script = document.getElementById('google-gsi-script');
        if (script) {
          script.onload = initializeGsi;
        }
      }
    }

  }, [user, onLogin]);

  return (
    <header className="bg-secondary sticky top-0 z-10 border-b border-border-color shadow-md">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RssIcon className="w-8 h-8 text-accent2" />
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            TechStream<span className="text-accent">AI</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />
              <span className="hidden sm:inline text-text-primary font-semibold">{user.name}</span>
              <button 
                onClick={onLogout}
                className="bg-accent text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors duration-200"
              >
                登出
              </button>
            </>
          ) : (
            <div ref={googleSignInButton}></div>
          )}
        </div>
      </div>
    </header>
  );
};