import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

/**
 * Process — quy trình mượn sách dạng accordion kiểu Positivus:
 * - Mỗi bước là thẻ bo tròn, bấm để mở/đóng nội dung
 * - Icon dấu cộng xoay thành dấu nhân khi mở
 * - AnimatePresence giúp nội dung trượt mở/đóng mượt mà
 */
const STEPS = [
  {
    number: "01",
    title: "Tìm kiếm sách",
    content:
      "Dùng ô tìm kiếm để tra cứu theo tên sách hoặc tác giả, hoặc duyệt kho sách theo thể loại yêu thích.",
  },
  {
    number: "02",
    title: "Đăng nhập thẻ thư viện",
    content:
      "Dùng tài khoản của bạn để truy cập hệ thống. Chưa có tài khoản? Đăng ký miễn phí chỉ mất chưa đầy một phút.",
  },
  {
    number: "03",
    title: "Mượn sách",
    content:
      "Chọn cuốn sách còn khả dụng và bấm Mượn. Hệ thống tự động kiểm tra giới hạn 3 cuốn và trừ số lượng trên kệ.",
  },
  {
    number: "04",
    title: "Nhận sách",
    content:
      "Mang phiếu mượn tới quầy thủ thư để nhận sách. Chỉ vài phút là bạn đã có cuốn sách trong tay.",
  },
  {
    number: "05",
    title: "Đọc và trải nghiệm",
    content:
      "Tận hưởng cuốn sách trong 14 ngày. Hệ thống nhắc hạn trả để bạn không bao giờ quên ngày trả sách.",
  },
  {
    number: "06",
    title: "Trả sách đúng hạn",
    content:
      "Trả sách để mở lại lượt mượn mới. Sách quay về kệ, và hành trình tri thức của bạn tiếp tục.",
  },
];

function ProcessItem({ step, isOpen, onToggle }) {
  return (
    <Reveal direction="up">
      <article className={`process-item ${isOpen ? "process-item--open" : ""}`}>
        <button type="button" className="process-item__header" onClick={onToggle} aria-expanded={isOpen}>
          <span className="process-item__number">{step.number}</span>
          <h3 className="process-item__title">{step.title}</h3>
          <span className="process-item__toggle" aria-hidden="true">
            <span className="process-item__toggle-bar" />
            <span className={`process-item__toggle-bar process-item__toggle-bar--vertical ${isOpen ? "process-item__toggle-bar--rotated" : ""}`} />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="process-item__body-wrap"
            >
              <div className="process-item__body">
                <div className="process-item__divider" />
                <p className="process-item__content">{step.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </Reveal>
  );
}

export default function Process() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="process" className="process">
      <div className="container">
        <SectionHeading
          label="Quy trình"
          title="Hành trình"
          highlight="6 giai đoạn"
          description="Từ lúc tìm kiếm đến khi trả sách — quy trình rõ ràng, bạn luôn biết mình đang ở đâu."
        />

        <div className="process__list">
          {STEPS.map((step, index) => (
            <ProcessItem
              key={step.number}
              step={step}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
