import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api/client";

/**
 * AuthContext — quản lý phiên đăng nhập toàn app.
 *
 * - token  : lưu trong localStorage → mở lại trang vẫn còn phiên
 * - user   : thông tin từ GET /api/auth/me (gồm role để phân quyền UI)
 * - Khi khởi động có token → tự gọi /me để nạp user; token hết hạn (401)
 *   → tự xoá phiên, không làm app crash.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Nạp thông tin user khi có token (kể cả khi refresh trang)
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then(setUser)
      .catch(() => {
        // Token sai/hết hạn → xoá phiên
        setToken(null);
        setTokenState(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username, password) => {
    const data = await api.login(username, password); // trả { access_token, token_type }
    setToken(data.access_token);
    setTokenState(data.access_token);

    const me = await api.getMe();
    setUser(me);
    return me;
  };

  const register = (payload) => api.register(payload);

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return context;
}
