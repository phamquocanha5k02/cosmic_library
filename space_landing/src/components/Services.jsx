import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Services — 6 tiện ích thư viện kiểu Positivus:
 * - Số thứ tự to đậm ở góc, tiêu đề bọc khối tròn
 * - Mũi tên "Khám phá" ở góc dưới
 * - 3 kiểu nền xen kẽ: tím sáng / tím gradient / viền phát sáng
 */
const SERVICES = [
  {
    number: "01",
    title: "Tra cứu thông minh",
    description:
      "Tìm sách theo tên hoặc tác giả trong vài giây — như radar quét khắp thiên hà tri thức.",
    theme: "light",
  },
  {
    number: "02",
    title: "Mượn sách trực tuyến",
    description:
      "Đặt mượn từ xa bất kỳ lúc nào, mỗi người được mượn tối đa 3 cuốn cùng lúc, hạn 14 ngày.",
    theme: "gradient",
  },
  {
    number: "03",
    title: "Quản lý phiếu mượn",
    description:
      "Theo dõi phiếu mượn, hạn trả và lịch sử mượn/trả của bạn trên một bảng điều khiển duy nhất.",
    theme: "outline",
  },
  {
    number: "04",
    title: "Kho sách đa dạng",
    description:
      "Khoa học, văn học, công nghệ, thiếu nhi... 25+ thể loại với hơn 1.200 đầu sách luôn trên kệ.",
    theme: "light",
  },
  {
    number: "05",
    title: "Quản trị thư viện",
    description:
      "Công cụ dành cho thủ thư: thêm, sửa, xoá sách và thể loại một cách trực quan, an toàn.",
    theme: "gradient",
  },
  {
    number: "06",
    title: "Hỗ trợ độc giả 24/7",
    description:
      "Đội ngũ thủ thư luôn sẵn sàng hướng dẫn bạn tìm đúng cuốn sách trên đúng quỹ đạo của nó.",
    theme: "outline",
  },
];

export default function Services() {
  return (
    <section id="services" className="services">
      <div className="container">
        <SectionHeading
          label="Tiện ích"
          title="Khám phá các sứ mệnh"
          highlight="của thư viện"
          description="Sáu quỹ đạo tiện ích, một hệ thống duy nhất — đồng hành cùng bạn từ khi tìm sách đến khi trả sách."
        />

        <div className="services__grid">
          {SERVICES.map((service, index) => (
            <Reveal key={service.number} direction="up" delay={(index % 2) * 0.12}>
              <article className={`service-card service-card--${service.theme}`}>
                <span className="service-card__number">{service.number}</span>
                <div className="service-card__body">
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__description">{service.description}</p>
                  <Link to="/books" className="arrow-link">
                    <span className="arrow-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                    Khám phá kho sách
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
