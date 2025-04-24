import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const { register } = useSocket();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await register(username);
      if (!response.success) {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Chat App</h1>
        <p className={styles.subtitle}>Enter a username to start chatting</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={styles.input}
            disabled={isLoading}
          />
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;