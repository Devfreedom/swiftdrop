// Auth state: token in localStorage, user from /me. Role drives redirects.
import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthCtx = createContext(null);
export const roleHome = (role) =>
  role === "ADMIN" ? "/admin" : role === "RIDER" ? "/rider" : "/customer";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(getToken());
  const [loading, setLoading] = useState(!!getToken());

  // On reload, recover the user from the stored token.
  useEffect(() => {
    if (!token) return setLoading(false);
    api("/me")
      .then((d) => setUser(d.user))
      .catch(() => {
        setToken(null);
        setTok(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const d = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(d.token);
    setTok(d.token);
    setUser(d.user);
    return d.user;
  }
  async function register(name, email, password) {
    const d = await api("/auth/register", { method: "POST", body: { name, email, password } });
    setToken(d.token);
    setTok(d.token);
    setUser(d.user);
    return d.user;
  }
  function logout() {
    setToken(null);
    setTok(null);
    setUser(null);
  }
  return (
    <AuthCtx.Provider value={{ user, setUser, token, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
