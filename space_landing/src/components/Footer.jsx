import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Kho sách", href: "/books" },
  { label: "Đăng nhập", href: "/login" },
  { label: "Đăng ký", href: "/register" },
];

const SOCIALS = [
  {
    label: "LinkedIn",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-8.5c0-2.03-.04-4.64-2.83-4.64-2.83 0-3.26 2.2-3.26 4.5V24h-4V8z" />
      </svg>
    ),
  },
  {
    label: "X",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.81 8.2 11.4.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.38.82 1.11.82 2.24v3.33c0 .32.21.7.82.58A12.02 12.02 0 0 0 24 12C24 5.37 18.63 0 12 0z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#top" className="navbar__logo" aria-label="Cosmic Library">
              <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="9" fill="url(#footerGradient)" />
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
                  <linearGradient id="footerGradient" x1="11" y1="11" x2="29" y2="29">
                    <stop stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="navbar__brand">Cosmic Library</span>
            </a>
            <p className="footer__description">
              Thư viện số của bạn trong vũ trụ tri thức — mượn sách mọi lúc,
              mọi nơi, trên mọi quỹ đạo.
            </p>
          </div>

          <nav className="footer__nav" aria-label="Liên kết chân trang">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} to={link.href} className="footer__link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="footer__contact">
            <p className="footer__contact-title">Trung tâm liên lạc</p>
            <a href="mailto:hashkidev@gmail.com">hashkidev@gmail.com</a>
            <a href="tel:0356533190">0356533190</a>
            <p className="footer__address">138/3 Cao Thắng, Phường Vườn Lài, TP. Hồ Chí Minh</p>
          </div>

          <div className="footer__socials">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href="#top"
                className="footer__social"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Cosmic Library. Tất cả các quyền được bảo lưu giữa các vì sao.</p>
          <div className="footer__legal">
            <a href="#top">Chính sách bảo mật</a>
            <a href="#top">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
