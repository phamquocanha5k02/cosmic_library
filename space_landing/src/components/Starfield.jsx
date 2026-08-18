import { useEffect, useRef } from "react";

/**
 * Starfield — nền sao vũ trụ vẽ bằng canvas.
 * - Hàng trăm ngôi sao lấp lánh (twinkle theo hàm sin)
 * - Thỉnh thoảng có sao băng vụt ngang
 * Canvas rẻ hơn nhiều DOM node nên phù hợp làm nền cố định.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let shootingStars = [];
    let animationId;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Mật độ sao tỉ lệ với diện tích màn hình
      const count = Math.floor((width * height) / 6000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.6 + width * 0.3,
        y: Math.random() * height * 0.35,
        length: 120 + Math.random() * 120,
        speed: 8 + Math.random() * 6,
        angle: Math.PI / 4 + Math.random() * 0.35,
        life: 1,
      });
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Ngôi sao lấp lánh
      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.phase);
        ctx.globalAlpha = star.baseAlpha * (0.45 + 0.55 * (0.5 + 0.5 * twinkle));
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sao băng (xác suất thấp, tối đa 2 cùng lúc)
      if (Math.random() < 0.004 && shootingStars.length < 2) {
        spawnShootingStar();
      }
      shootingStars = shootingStars.filter((s) => s.life > 0);
      for (const s of shootingStars) {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= 0.018;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;
        const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(196, 181, 253, ${Math.max(s.life, 0)})`);
        gradient.addColorStop(1, "rgba(196, 181, 253, 0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
