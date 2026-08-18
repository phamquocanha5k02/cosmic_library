import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const STATS = [
  { value: "1.200+", label: "Đầu sách trên kệ" },
  { value: "25+", label: "Thể loại đa dạng" },
  { value: "14 ngày", label: "Hạn mượn mỗi phiếu" },
];

/**
 * Hero — mở đầu trang chủ thư viện:
 * - Bên trái: headline + mô tả + 2 nút CTA + chỉ số
 * - Bên phải: hành tinh tím có vành đai, quỹ đạo quay cùng vệ tinh
 *   (đúng tinh thần "bố cục Positivus + không gian")
 */
export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <Reveal direction="up">
            <span className="section-label">Thư viện vũ trụ tri thức</span>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <h1 className="hero__title">
              Mượn tri thức,{" "}
              <span className="text-gradient">chinh phục các vì sao</span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <p className="hero__description">
              Cosmic Library là thư viện số của bạn trong vũ trụ tri thức:
              tìm sách, mượn trực tuyến và theo dõi phiếu mượn — tất cả
              trong một quỹ đạo duy nhất.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <div className="hero__actions">
              <Link to="/books" className="btn btn--primary">
                Khám phá kho sách
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#services" className="btn btn--ghost">
                Tiện ích thư viện
              </a>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.4}>
            <div className="hero__stats">
              {STATS.map((stat) => (
                <div key={stat.label} className="hero__stat">
                  <strong className="hero__stat-value">{stat.value}</strong>
                  <span className="hero__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Hành tinh minh hoạ */}
        <Reveal direction="right" delay={0.2} className="hero__visual">
          <motion.div
            className="planet-scene"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="planet-scene__core">
              <div className="planet" />
              <div className="planet-ring" />
            </div>

            {/* Quỹ đạo quay tròn với vệ tinh */}
            <div className="planet-scene__orbit">
              <div className="planet-scene__orbit-ring" />
              <div className="planet-scene__moon" />
            </div>

            {/* Badge nổi */}
            <motion.div
              className="planet-scene__badge planet-scene__badge--top"
              animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="planet-scene__badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              <div>
                <strong>Sách mới về</strong>
                <small>Cập nhật mỗi tuần</small>
              </div>
            </motion.div>

            <motion.div
              className="planet-scene__badge planet-scene__badge--bottom"
              animate={{ y: [0, 12, 0], rotate: [3, -3, 3] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <span className="planet-scene__badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
                </svg>
              </span>
              <div>
                <strong>Mở cửa 24/7</strong>
                <small>Mượn trực tuyến mọi lúc</small>
              </div>
            </motion.div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
