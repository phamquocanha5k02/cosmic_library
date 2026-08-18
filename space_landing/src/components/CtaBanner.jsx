import { Link } from "react-router-dom";
import Reveal from "./Reveal";

/**
 * CtaBanner — banner kêu gọi đăng ký thẻ thư viện kiểu Positivus:
 * gradient tím phát sáng, hành tinh nhỏ nổi trang trí bên phải.
 */
export default function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="container">
        <Reveal direction="up">
          <div className="cta-banner__card">
            <div className="cta-banner__content">
              <h2 className="cta-banner__title">
                Chưa có <span className="text-gradient">thẻ thư viện</span>?
              </h2>
              <p className="cta-banner__description">
                Đăng ký miễn phí để bắt đầu mượn sách ngay hôm nay — không cần
                giấy tờ, không cần xếp hàng. Chỉ cần một tài khoản.
              </p>
              <Link to="/register" className="btn btn--primary">
                Đăng ký ngay
              </Link>
            </div>

            <div className="cta-banner__planet" aria-hidden="true">
              <div className="cta-banner__planet-sphere" />
              <div className="cta-banner__planet-ring" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
