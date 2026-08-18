import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * CaseStudies — thống kê nổi bật của thư viện, 3 thẻ kiểu Positivus.
 * Một thẻ "nổi bật" hơi chếch lên trên để tạo nhịp thị giác.
 */
const HIGHLIGHTS = [
  {
    title: "Khoa học & Công nghệ",
    kind: "Ngăn kệ lớn nhất",
    result: "500+",
    metric: "đầu sách khoa học, lập trình, AI cho mọi trình độ",
    featured: true,
  },
  {
    title: "Văn học Việt Nam",
    kind: "Yêu thích nhất",
    result: "300+",
    metric: "tác phẩm văn học trong nước, từ kinh điển đến mới nhất",
    featured: false,
  },
  {
    title: "Độc giả hài lòng",
    kind: "Chất lượng dịch vụ",
    result: "98%",
    metric: "độc giả quay lại mượn sách lần thứ hai trở lên",
    featured: false,
  },
];

export default function CaseStudies() {
  return (
    <section id="case-studies" className="case-studies">
      <div className="container">
        <SectionHeading
          label="Số liệu"
          title="Những con số"
          highlight="biết nói"
          description="Kho tri thức đang lớn dần mỗi ngày — và con số dưới đây là bằng chứng rõ ràng nhất."
        />

        <div className="case-studies__grid">
          {HIGHLIGHTS.map((item, index) => (
            <Reveal key={item.title} direction="up" delay={index * 0.12}>
              <article className={`case-card ${item.featured ? "case-card--featured" : ""}`}>
                <span className="case-card__kind">{item.kind}</span>
                <h3 className="case-card__title">{item.title}</h3>
                <p className="case-card__result">{item.result}</p>
                <p className="case-card__metric">{item.metric}</p>
                <Link to="/books" className="case-card__link">
                  Khám phá ngay
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
