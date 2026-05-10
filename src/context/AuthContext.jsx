import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext — Gestión global de sesión.
 * Almacena token + datos del usuario en localStorage.
 * Consumido por: Login.jsx, rutas protegidas, panels de cada rol.
 */

const AuthContext = createContext(null);

const TOKEN_KEY  = 'gitt_token';
const USER_KEY   = 'gitt_user';

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY)   || null);
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  /** Llama tras login exitoso */
  const guardarSesion = useCallback((nuevoToken, datosUsuario) => {
    localStorage.setItem(TOKEN_KEY, nuevoToken);
    localStorage.setItem(USER_KEY, JSON.stringify(datosUsuario));
    setToken(nuevoToken);
    setUsuario(datosUsuario);
  }, []);

  /** Cierra sesión */
  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const estaAutenticado = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, usuario, estaAutenticado, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de acceso rápido */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default AuthContext;
