import Reveal from "./Reveal";

/**
 * SectionHeading — tiêu đề section kiểu Positivus:
 * - Dòng tiêu đề lớn, có 1 từ nổi bật trong khối tím bo tròn
 * - Mô tả ngắn đặt bên phải trên desktop, xuống dòng trên mobile
 */
export default function SectionHeading({ label, title, highlight, description }) {
  return (
    <div className="section-heading">
      <Reveal direction="up">
        <div className="section-heading__left">
          {label && <span className="section-label">{label}</span>}
          <h2 className="section-heading__title">
            {title} {highlight && <span className="section-heading__highlight">{highlight}</span>}
          </h2>
        </div>
      </Reveal>
      {description && (
        <Reveal direction="up" delay={0.15}>
          <p className="section-heading__description">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
