import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [administrador, setAdministrador] = useState(() => {
    const stored = localStorage.getItem('administrador');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (nuevoToken, nuevoAdministrador) => {
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('administrador', JSON.stringify(nuevoAdministrador));
    setToken(nuevoToken);
    setAdministrador(nuevoAdministrador);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('administrador');
    setToken(null);
    setAdministrador(null);
  };

  const value = {
    token,
    administrador,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
