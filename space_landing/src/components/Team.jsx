import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Team — đội ngũ thủ thư của thư viện.
 * Avatar là vòng tròn gradient tím có chữ cái đầu + vòng quỹ đạo trang trí.
 */
const TEAM = [
  { name: "Nguyễn Văn An", role: "Thủ thư trưởng", initials: "NA" },
  { name: "Trần Minh", role: "Phụ trách Khoa học", initials: "TM" },
  { name: "Phạm Thu Hà", role: "Phụ trách Văn học", initials: "TH" },
  { name: "Lê Hoàng", role: "Chuyên viên CNTT", initials: "LH" },
  { name: "Vũ Ngọc Anh", role: "Phụ trách Thiếu nhi", initials: "VN" },
  { name: "Đỗ Quang", role: "Chăm sóc độc giả", initials: "ĐQ" },
];

export default function Team() {
  return (
    <section id="team" className="team">
      <div className="container">
        <SectionHeading
          label="Đội ngũ"
          title="Những người"
          highlight="giữ lửa tri thức"
          description="Các thủ thư đứng sau mỗi cuốn sách trên kệ — tận tâm, nhiệt huyết và luôn sẵn sàng hỗ trợ bạn."
        />

        <div className="team__grid">
          {TEAM.map((member, index) => (
            <Reveal key={member.name} direction="up" delay={(index % 3) * 0.1}>
              <article className="team-card">
                <div className="team-card__avatar" aria-hidden="true">
                  <span className="team-card__avatar-initials">{member.initials}</span>
                  <span className="team-card__orbit" />
                </div>
                <div className="team-card__info">
                  <h3 className="team-card__name">{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                </div>
                <div className="team-card__socials">
                  <a href="mailto:hello@cosmiclibrary.vn" aria-label={`Email ${member.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="m2 7 10 6L22 7" />
                    </svg>
                  </a>
                  <a href="#top" aria-label={`Zalo của ${member.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.77 1.42 5.23 3.64 6.84-.13.66-.55 2.14-1.1 2.36 0 0 1.78-.24 3.4-1.2.77.23 1.58.36 2.42.36 4.14.22 7.64-2.84 7.64-6.72 0-4.86-4.48-8.8-10-8.8z" />
                    </svg>
                  </a>
                  <a href="#top" aria-label={`Facebook của ${member.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
                    </svg>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
