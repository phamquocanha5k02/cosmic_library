import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";

/**
 * LoginPage — đăng nhập, gửi tới POST /api/auth/login (form OAuth2).
 * Thành công → quay về trang trước đó (hoặc /books).
 */
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/books");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <Reveal direction="up">
          <div className="auth-card">
            <div className="auth-card__planet" aria-hidden="true" />
            <span className="section-label">Chào mừng trở lại</span>
            <h1 className="auth-card__title">
              Đăng nhập vào <span className="text-gradient">thư viện</span>
            </h1>
            <p className="auth-card__description">
              Dùng tài khoản thẻ thư viện để mượn sách và theo dõi phiếu mượn của bạn.
            </p>

            <form className="auth-card__form" onSubmit={handleSubmit}>
              <div className="contact__field">
                <label htmlFor="login-username">Tên đăng nhập</label>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="vd: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="login-password">Mật khẩu</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="auth-card__error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn--primary auth-card__submit" disabled={submitting}>
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="auth-card__switch">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="auth-card__link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
