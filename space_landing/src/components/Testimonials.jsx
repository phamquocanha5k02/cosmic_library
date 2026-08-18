import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Testimonials — carousel cảm nhận độc giả:
 * - Tự động chuyển slide mỗi 6 giây, tạm dừng khi hover
 * - Nút mũi tên chuyển slide thủ công
 * - AnimatePresence tạo hiệu ứng trượt qua lại giữa các slide
 */
const TESTIMONIALS = [
  {
    quote:
      "Thư viện vũ trụ này giúp tôi tìm sách nhanh chưa từng thấy. Gõ tên cuốn sách là có ngay kết quả, mượn online rất tiện.",
    name: "Nguyễn Minh Anh",
    role: "Sinh viên CNTT",
  },
  {
    quote:
      "Quy trình mượn rất rõ ràng: tìm sách, bấm mượn, ra quầy nhận sách. Hệ thống còn nhắc hạn trả nên không bao giờ quên.",
    name: "Trần Quốc Huy",
    role: "Kỹ sư phần mềm",
  },
  {
    quote:
      "Kho sách văn học đa dạng bất ngờ. Tôi tìm được những cuốn tưởng chừng đã tuyệt bản từ lâu.",
    name: "Lê Thu Hà",
    role: "Giáo viên Ngữ văn",
  },
  {
    quote:
      "Quản trị viên thư viện của trường tôi dùng trang này rất thuận — thêm sách mới, cập nhật số lượng đều vài thao tác là xong.",
    name: "Phạm Đức Long",
    role: "Cán bộ thư viện",
  },
];

const SLIDE_DURATION = 6000;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (direction) => {
    setIndex((current) => (current + direction + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Tự động chuyển slide
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => goTo(1), SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [paused]);

  const current = TESTIMONIALS[index];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <SectionHeading
          label="Đánh giá"
          title="Lời kể từ"
          highlight="độc giả"
          description="Họ đã cùng chúng tôi đi qua nhiều chuyến phiêu lưu tri thức — đây là những gì họ nói về thư viện."
        />

        <Reveal direction="up">
          <div
            className="testimonials__carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Ô thoại với đuôi nói kiểu Positivus */}
            <div className="testimonials__viewport">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={index}
                  className="testimonial-bubble"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <blockquote className="testimonial-bubble__quote">
                    "{current.quote}"
                  </blockquote>
                  <figcaption className="testimonial-bubble__author">
                    <strong>{current.name}</strong>
                    <span>{current.role}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Điều khiển */}
            <div className="testimonials__controls">
              <button
                type="button"
                className="testimonials__nav"
                onClick={() => goTo(-1)}
                aria-label="Đánh giá trước"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="testimonials__dots" role="tablist" aria-label="Chọn đánh giá">
                {TESTIMONIALS.map((item, dotIndex) => (
                  <button
                    key={item.name}
                    type="button"
                    role="tab"
                    aria-selected={dotIndex === index}
                    aria-label={`Đánh giá ${dotIndex + 1}`}
                    className={`testimonials__dot ${dotIndex === index ? "testimonials__dot--active" : ""}`}
                    onClick={() => setIndex(dotIndex)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="testimonials__nav"
                onClick={() => goTo(1)}
                aria-label="Đánh giá sau"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
