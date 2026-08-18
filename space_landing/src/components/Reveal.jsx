import { motion } from "framer-motion";

/**
 * Reveal — wrapper dùng chung cho hiệu ứng xuất hiện khi cuộn tới.
 * - direction: "up" | "down" | "left" | "right" — hướng phần tử trượt vào
 * - delay: trì hoãn (giây) để tạo hiệu ứng nối tiếp nhau
 * - once: chỉ chạy 1 lần khi vào viewport (tránh lặp lại khi cuộn lên xuống)
 */
export default function Reveal({ children, direction = "up", delay = 0, className = "" }) {
  const offsets = {
    up: { y: 48 },
    down: { y: -48 },
    left: { x: -48 },
    right: { x: 48 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
