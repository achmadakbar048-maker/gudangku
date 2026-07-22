import React, { useEffect, useRef } from "react";

// Latar animasi untuk halaman login: partikel yang bergerak pelan dengan garis
// penghubung (efek "jaringan"), ditambah beberapa kubus 3D tembus pandang yang
// berputar dan melayang. Murni CSS + Canvas 2D, tidak menambah dependency.
export default function LoginAnimation({ enabled = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lebar = 0, tinggi = 0, titik = [], rafId;

    function ukurUlang() {
      lebar = canvas.width = canvas.offsetWidth * dpr;
      tinggi = canvas.height = canvas.offsetHeight * dpr;
    }

    function buatTitik() {
      const jumlah = Math.round((canvas.offsetWidth * canvas.offsetHeight) / 24000) + 14;
      titik = Array.from({ length: jumlah }, () => ({
        x: Math.random() * lebar,
        y: Math.random() * tinggi,
        vx: (Math.random() - 0.5) * 0.3 * dpr,
        vy: (Math.random() - 0.5) * 0.3 * dpr,
      }));
    }

    function gambar() {
      ctx.clearRect(0, 0, lebar, tinggi);
      const jarakMax = 150 * dpr;

      for (const t of titik) {
        t.x += t.vx;
        t.y += t.vy;
        if (t.x <= 0 || t.x >= lebar) t.vx *= -1;
        if (t.y <= 0 || t.y >= tinggi) t.vy *= -1;
      }

      for (let i = 0; i < titik.length; i++) {
        for (let j = i + 1; j < titik.length; j++) {
          const a = titik[i], b = titik[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const jarak = Math.sqrt(dx * dx + dy * dy);
          if (jarak < jarakMax) {
            ctx.strokeStyle = `rgba(63,167,150,${0.32 * (1 - jarak / jarakMax)})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const t of titik) {
        ctx.fillStyle = "rgba(110,220,200,0.85)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.7 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(gambar);
    }

    ukurUlang();
    buatTitik();
    gambar();

    function saatResize() { ukurUlang(); buatTitik(); }
    window.addEventListener("resize", saatResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", saatResize);
    };
  }, [enabled]);

  const kubus = [
    { sisi: 90, top: "10%", left: "10%", putar: 26, mengambang: 8, delay: 0 },
    { sisi: 150, top: "4%", left: "80%", putar: 34, mengambang: 10, delay: 1.2 },
    { sisi: 70, top: "68%", left: "16%", putar: 22, mengambang: 7, delay: 0.6 },
    { sisi: 130, top: "74%", left: "84%", putar: 30, mengambang: 9, delay: 2 },
    { sisi: 55, top: "40%", left: "6%", putar: 18, mengambang: 6, delay: 1.6 },
  ];

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      <style>{`
        @keyframes gkPutarKubus { from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); } }
        @keyframes gkMengambangKubus { from { transform: translateY(0px); } to { transform: translateY(-22px); } }
      `}</style>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {enabled && kubus.map((k, i) => (
        <div key={i} style={{
          position: "absolute", top: k.top, left: k.left, width: k.sisi, height: k.sisi,
          animation: `gkMengambangKubus ${k.mengambang}s ease-in-out ${k.delay}s infinite alternate`,
        }}>
          <div style={{ width: "100%", height: "100%", perspective: 700 }}>
            <div style={{
              width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d",
              animation: `gkPutarKubus ${k.putar}s linear infinite`,
            }}>
              {["front", "back", "right", "left", "top", "bottom"].map(sisi => {
                const setengah = k.sisi / 2;
                const transformMap = {
                  front: `translateZ(${setengah}px)`,
                  back: `rotateY(180deg) translateZ(${setengah}px)`,
                  right: `rotateY(90deg) translateZ(${setengah}px)`,
                  left: `rotateY(-90deg) translateZ(${setengah}px)`,
                  top: `rotateX(90deg) translateZ(${setengah}px)`,
                  bottom: `rotateX(-90deg) translateZ(${setengah}px)`,
                };
                return (
                  <div key={sisi} style={{
                    position: "absolute", width: "100%", height: "100%",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.16)", transform: transformMap[sisi],
                  }} />
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
