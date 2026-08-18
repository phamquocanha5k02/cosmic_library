/**
 * LogoStrip — dải logo nhà xuất bản đối tác chạy vô tận (marquee).
 * Nội dung lặp lại 2 lần để hiệu ứng trượt liền mạch không bị hụt.
 */
const PARTNERS = [
  "NXB Kim Đồng",
  "NXB Trẻ",
  "Văn Học",
  "NXB Giáo Dục",
  "Khoa Học Kỹ Thuật",
  "NXB Thế Giới",
  "Tổng Hợp TP.HCM",
];

export default function LogoStrip() {
  const row = [...PARTNERS, ...PARTNERS];

  return (
    <section className="logo-strip" aria-label="Đối tác của thư viện">
      <div className="container">
        <p className="logo-strip__note">Hợp tác cùng các nhà xuất bản hàng đầu</p>
      </div>
      <div className="logo-strip__track">
        <div className="logo-strip__row">
          {row.map((name, index) => (
            <span key={`${name}-${index}`} className="logo-strip__item">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
