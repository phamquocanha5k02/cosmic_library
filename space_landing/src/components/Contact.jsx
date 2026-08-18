import { useState } from "react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Contact — form liên hệ + thẻ thông tin thư viện kiểu Positivus.
 * Form giả lập gửi thành công bằng state (landing page, chưa có backend cho yêu cầu hỗ trợ).
 */
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <SectionHeading
          label="Liên hệ"
          title="Kết nối với"
          highlight="thư viện"
          description="Có câu hỏi về sách, phiếu mượn hay cần trợ giúp? Gửi tín hiệu cho chúng tôi — phản hồi trong 24 giờ."
        />

        <Reveal direction="up">
          <div className="contact__card">
            {/* Form */}
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__field">
                <label htmlFor="contact-name">Tên của bạn</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Nguyễn Vũ Trụ"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="ban@tenmien.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-message">Nội dung yêu cầu</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  required
                  placeholder="Kể chúng tôi nghe bạn cần hỗ trợ điều gì..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              {submitted && (
                <p className="contact__success" role="status">
                  Tín hiệu đã được gửi! Thư viện sẽ liên hệ với bạn sớm nhất.
                </p>
              )}

              <button type="submit" className="btn btn--primary contact__submit">
                Gửi yêu cầu hỗ trợ
              </button>
            </form>

            {/* Thẻ thông tin */}
            <aside className="contact__info">
              <div className="contact__info-planet" aria-hidden="true" />
              <h3 className="contact__info-title">Trung tâm liên lạc</h3>
              <p className="contact__info-text">
                Thủ thư luôn túc trực. Chọn một trong các kênh dưới đây để bắt đầu cuộc trò chuyện.
              </p>

              <ul className="contact__channels">
                <li>
                  <span className="contact__channel-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="m2 7 10 6L22 7" />
                    </svg>
                  </span>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:haskidev@gmail.com">hashkidev@gmail.com</a>
                  </div>
                </li>
                <li>
                  <span className="contact__channel-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <strong>Hotline</strong>
                    <a href="tel:0366533190">0356533190</a>
                  </div>
                </li>
                <li>
                  <span className="contact__channel-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <strong>Địa chỉ</strong>
                    <span>138/3 Cao Thắng, Phường Vườn Lài, TP. Hồ Chí Minh</span>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
