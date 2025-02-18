import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // In authContext.js, modify the login function:
const login = (newToken) => {
  // Make sure we're not storing the "Bearer " prefix
  const tokenToStore = newToken.startsWith('Bearer ') ? newToken.split(' ')[1] : newToken;
  localStorage.setItem('token', tokenToStore);
  setToken(tokenToStore);
};

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);