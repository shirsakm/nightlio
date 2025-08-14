import { Zap, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const Header = ({ currentView, currentStreak }) => {
  const { user, logout } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const getSubtitle = () => {
    switch (currentView) {
      case 'history':
        return 'How are you feeling today?';
      case 'entry':
        return `Recording for ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString(
          [],
          { hour: '2-digit', minute: '2-digit', hour12: true }
        )}`;
      case 'stats':
        return 'Your mood insights and patterns';
      case 'achievements':
        return 'Unlock achievements and mint them as NFTs on Sepolia testnet';
      default:
        return 'Your daily mood companion';
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        {/* Left side - Logo and Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0',
              fontSize: '3.5rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
            }}
          >
            Nightlio
          </h1>
          {currentStreak > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
              }}
            >
              <Zap size={16} />
              <span>{currentStreak}</span>
            </div>
          )}
        </div>

        {/* Right side - User Profile & Web3 */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Web3 Connect Button */}
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <Wallet size={14} />
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => disconnect()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <Wallet size={14} />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            )}

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #667eea'
                  }}
                />
              )}
              <span style={{ 
                color: '#666', 
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {user.name}
              </span>
            </div>
            
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#666',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
      <p
        style={{
          color: '#666',
          margin: '0.5rem 0',
          fontSize: '1.2rem',
          fontWeight: '400',
        }}
      >
        Your daily mood companion
      </p>
      <p
        style={{
          color: '#999',
          margin: '0',
          fontSize: '1rem',
          fontWeight: '300',
        }}
      >
        {getSubtitle()}
      </p>
    </div>
  );
};

export default Header;