import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";

/**
 * RegisterPage — đăng ký thẻ thư viện mới.
 * Gửi POST /api/auth/register rồi tự động đăng nhập để vào ngay kho sách.
 */
export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", fullName: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        full_name: form.fullName.trim(),
        password: form.password,
      });
      // Đăng ký xong → đăng nhập luôn (mượn sách ngay)
      await login(form.username.trim(), form.password);
      navigate("/books");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
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
            <span className="section-label">Thẻ thư viện mới</span>
            <h1 className="auth-card__title">
              Tạo tài khoản <span className="text-gradient">miễn phí</span>
            </h1>
            <p className="auth-card__description">
              Đăng ký để bắt đầu mượn sách từ kho tri thức vũ trụ của chúng tôi.
            </p>

            <form className="auth-card__form" onSubmit={handleSubmit}>
              <div className="contact__field">
                <label htmlFor="register-username">Tên đăng nhập (3-50 ký tự)</label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  autoComplete="username"
                  placeholder="vd: nguyen_anh"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="register-fullname">Họ và tên</label>
                <input
                  id="register-fullname"
                  name="fullName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="vd: Nguyễn Minh Anh"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="register-password">Mật khẩu (tối thiểu 6 ký tự)</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="register-confirm">Nhập lại mật khẩu</label>
                <input
                  id="register-confirm"
                  name="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p className="auth-card__error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn--primary auth-card__submit" disabled={submitting}>
                {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
              </button>
            </form>

            <p className="auth-card__switch">
              Đã có tài khoản?{" "}
              <Link to="/login" className="auth-card__link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
