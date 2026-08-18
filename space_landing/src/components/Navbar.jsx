import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Logo() {
  return (
    <Link to="/" className="navbar__logo" aria-label="Cosmic Library — về trang chủ">
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="9" fill="url(#logoGradient)" />
        <ellipse
          cx="20"
          cy="20"
          rx="17"
          ry="6"
          stroke="#c4b5fd"
          strokeWidth="2"
          transform="rotate(-24 20 20)"
          fill="none"
          opacity="0.85"
        />
        <circle cx="34" cy="10" r="2.4" fill="#f5f3ff" />
        <defs>
          <linearGradient id="logoGradient" x1="11" y1="11" x2="29" y2="29">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <span className="navbar__brand">Cosmic Library</span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Khóa cuộn nền khi mở menu mobile
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Logo />

        <nav className="navbar__links" aria-label="Điều hướng chính">
          <NavLink to="/" className="navbar__link" end>
            Trang chủ
          </NavLink>
          <NavLink to="/books" className="navbar__link">
            Kho sách
          </NavLink>
          {user && (
            <NavLink to="/my-borrows" className="navbar__link">
              Mượn của tôi
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className="navbar__link">
              Quản trị
            </NavLink>
          )}

          {loading ? (
            <span className="navbar__cta navbar__user">Đang tải...</span>
          ) : user ? (
            <div className="navbar__user">
              <span className="navbar__user-name" title={user.full_name}>
                {user.full_name}
              </span>
              <button type="button" className="btn btn--ghost navbar__logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary navbar__cta">
              Đăng nhập
            </Link>
          )}
        </nav>

        <button
          type="button"
          className={`navbar__burger ${menuOpen ? "navbar__burger--open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="navbar__mobile"
            aria-label="Điều hướng di động"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {[
              { to: "/", label: "Trang chủ" },
              { to: "/books", label: "Kho sách" },
              ...(user ? [{ to: "/my-borrows", label: "Mượn của tôi" }] : []),
              ...(user?.role === "admin" ? [{ to: "/admin", label: "Quản trị" }] : []),
            ].map((link, index) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
              >
                <Link to={link.to} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * 4 }}
            >
              {user ? (
                <button type="button" className="btn btn--ghost navbar__mobile-cta" onClick={handleLogout}>
                  Đăng xuất ({user.full_name})
                </button>
              ) : (
                <Link to="/login" className="btn btn--primary navbar__mobile-cta" onClick={() => setMenuOpen(false)}>
                  Đăng nhập
                </Link>
              )}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
