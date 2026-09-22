"use client";

import GlyphPortal from "@/components/ui/glyph-portal";

const GLYPH_FIELD_STYLE = {
  position: "absolute" as const,
  inset: 0,
  transform: "scale(var(--gp-field-scale,1))",
  background:
    "radial-gradient(circle at 18% 8%, rgba(124,132,114,.72), transparent 34%), " +
    "radial-gradient(circle at 82% 20%, rgba(245,243,238,.12), transparent 28%), " +
    "radial-gradient(circle at 48% 78%, rgba(84,82,77,.5), transparent 44%), " +
    "linear-gradient(135deg,#54524d 0%,#7c8472 48%,#54524d 100%)",
};

const FLOATING_PHOTOS = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop", top: "10%", left: "5%", rotate: -12, size: 110, anim: "gp-drift-1" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop", top: "20%", right: "4%", rotate: 8, size: 100, anim: "gp-drift-2" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop", top: "55%", left: "3%", rotate: 18, size: 95, anim: "gp-drift-3" },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop", top: "60%", right: "5%", rotate: -8, size: 105, anim: "gp-drift-4" },
  { src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop", top: "38%", left: "2%", rotate: 24, size: 85, anim: "gp-drift-5" },
  { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop", top: "45%", right: "2%", rotate: -20, size: 90, anim: "gp-drift-6" },
];

const FRONT_OVERLAY = (
  <>
    {/* Floating photos */}
    {FLOATING_PHOTOS.map((p, i) => (
      <div
        key={i}
        data-gp-float-photo
        style={{
          position: "absolute",
          top: p.top,
          left: "left" in p ? p.left : undefined,
          right: "right" in p ? p.right : undefined,
          width: p.size,
          height: p.size,
          borderRadius: 12,
          overflow: "hidden",
          opacity: 0.5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          border: "2px solid rgba(255,255,255,0.45)",
          animation: `${p.anim} ${10 + i * 2}s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      >
        <img
          src={p.src}
          alt=""
          width={p.size}
          height={p.size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    ))}

    {/* Top bar — brand + category */}
    <div
      style={{
        position: "absolute",
        inset: "clamp(20px, 4cqw, 40px) clamp(20px, 5cqw, 56px) auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <span
        style={{
          fontFamily: '"Marcellus", Georgia, serif',
          fontSize: "clamp(17px, 2cqw, 22px)",
          fontWeight: 400,
          letterSpacing: "-.04em",
          color: "#54524d",
        }}
      >
        wimah
      </span>
      <span
        style={{
          fontSize: "11px",
          lineHeight: 1.5,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "#8d8a82",
        }}
      >
        Undangan Digital Premium
      </span>
    </div>

    {/* Eyebrow — above the word */}
    <p
      style={{
        position: "absolute",
        inset: "auto 24px calc(100% - var(--gp-word-top, 35%) + 28px)",
        margin: 0,
        textAlign: "center",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "#8d8a82",
      }}
    >
      Mulai dari sini.
    </p>

    {/* Support line — below the word */}
    <p
      style={{
        position: "absolute",
        inset: "calc(var(--gp-word-bottom, 50%) + 28px) 24px auto",
        margin: 0,
        textAlign: "center",
        fontSize: "clamp(14px, 1.6cqw, 17px)",
        fontWeight: 400,
        lineHeight: 1.5,
        color: "#8d8a82",
        maxWidth: "36ch",
        marginLeft: "auto",
        marginRight: "auto",
        left: 0,
        right: 0,
      }}
    >
      Undangan pernikahan & acara spesial yang elegan, langsung dari browser Anda.
    </p>

    {/* Scroll hint — bottom */}
    <span
      style={{
        position: "absolute",
        inset: "auto 24px 6%",
        textAlign: "center",
        color: "#8d8a82",
        fontSize: "11px",
        letterSpacing: ".04em",
        textTransform: "uppercase",
      }}
    >
      Scroll untuk masuk ↓
    </span>

    {/* Decorative corner marks */}
    <svg
      style={{ position: "absolute", top: "clamp(20px, 4cqw, 40px)", left: "clamp(20px, 5cqw, 56px)", width: 24, height: 24, color: "#c4bfb3" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path d="M0 8V0h8" />
    </svg>
    <svg
      style={{ position: "absolute", top: "clamp(20px, 4cqw, 40px)", right: "clamp(20px, 5cqw, 56px)", width: 24, height: 24, color: "#c4bfb3" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path d="M24 8V0h-8" />
    </svg>
  </>
);

export function GlyphPortalSection() {
  return (
    <>
      <style>{`
        @keyframes gp-drift-1 {
          0% { transform: translate(0, 0) rotate(-12deg); }
          25% { transform: translate(30px, -20px) rotate(-8deg); }
          50% { transform: translate(-15px, -35px) rotate(-14deg); }
          75% { transform: translate(20px, -10px) rotate(-10deg); }
          100% { transform: translate(0, 0) rotate(-12deg); }
        }
        @keyframes gp-drift-2 {
          0% { transform: translate(0, 0) rotate(8deg); }
          25% { transform: translate(-25px, -15px) rotate(12deg); }
          50% { transform: translate(10px, -30px) rotate(6deg); }
          75% { transform: translate(-20px, -8px) rotate(10deg); }
          100% { transform: translate(0, 0) rotate(8deg); }
        }
        @keyframes gp-drift-3 {
          0% { transform: translate(0, 0) rotate(18deg); }
          25% { transform: translate(20px, -25px) rotate(22deg); }
          50% { transform: translate(-10px, -40px) rotate(16deg); }
          75% { transform: translate(15px, -12px) rotate(20deg); }
          100% { transform: translate(0, 0) rotate(18deg); }
        }
        @keyframes gp-drift-4 {
          0% { transform: translate(0, 0) rotate(-8deg); }
          25% { transform: translate(-30px, -18px) rotate(-4deg); }
          50% { transform: translate(12px, -32px) rotate(-10deg); }
          75% { transform: translate(-18px, -6px) rotate(-6deg); }
          100% { transform: translate(0, 0) rotate(-8deg); }
        }
        @keyframes gp-drift-5 {
          0% { transform: translate(0, 0) rotate(24deg); }
          25% { transform: translate(18px, -22px) rotate(20deg); }
          50% { transform: translate(-8px, -38px) rotate(26deg); }
          75% { transform: translate(22px, -14px) rotate(22deg); }
          100% { transform: translate(0, 0) rotate(24deg); }
        }
        @keyframes gp-drift-6 {
          0% { transform: translate(0, 0) rotate(-20deg); }
          25% { transform: translate(-22px, -16px) rotate(-16deg); }
          50% { transform: translate(8px, -28px) rotate(-22deg); }
          75% { transform: translate(-14px, -10px) rotate(-18deg); }
          100% { transform: translate(0, 0) rotate(-20deg); }
        }
      `}</style>
      <GlyphPortal
      word="WIMAH"
      fontFamily='"Marcellus", Georgia, serif'
      fontWeight={400}
      scrollLength={2.4}
      interactive={true}
      annotations={false}
      enterLabel="Mulai membuat"
      background={<div style={GLYPH_FIELD_STYLE} />}
      front={FRONT_OVERLAY}
      style={{
        "--gp-paper": "#f5f3ee",
        "--gp-ink": "#54524d",
        "--gp-field": "#54524d",
        "--gp-foreground": "#f5f3ee",
      } as React.CSSProperties}
    >
      <style>{`
        [data-gp-content] {
          padding: 5.5rem clamp(1.25rem, 5cqw, 5rem) 6.5rem;
          font-family: inherit;
          background: linear-gradient(180deg, #54524d 0%, #3d3b38 100%);
        }
        [data-gp-content] h2 {
          max-width: 48rem;
          margin: 0;
          color: #f5f3ee;
          font-size: clamp(1.75rem, 1.1rem + 2.1cqw, 2.25rem);
          font-weight: 400;
          line-height: 1.25;
          letter-spacing: 0;
          text-wrap: balance;
        }
        [data-gp-content] p {
          margin: 0;
          color: rgba(245, 243, 238, 0.85);
          font-size: clamp(1rem, 0.9rem + 0.5cqw, 1.125rem);
          line-height: 1.65;
          max-width: 48ch;
        }
        [data-gp-content] [data-wimah-divider] {
          width: 48px;
          height: 1px;
          background: rgba(212, 168, 83, 0.4);
          margin: 0;
        }
        [data-gp-content] [data-wimah-features] {
          display: grid;
          width: 100%;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        [data-gp-content] [data-wimah-feature] {
          border-top: 1px solid rgba(245, 243, 238, 0.12);
          padding-top: 1.1rem;
        }
        [data-gp-content] [data-wimah-feature] h3 {
          margin: 0;
          color: #f5f3ee;
          font-size: 1.125rem;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: 0;
        }
        [data-gp-content] [data-wimah-feature] p {
          margin: 0.55rem 0 0;
          color: rgba(245, 243, 238, 0.7);
          font-size: 0.9375rem;
          line-height: 1.55;
        }
        [data-gp-content] [data-wimah-no] {
          display: inline-block;
          margin-right: 0.7rem;
          color: rgba(212, 168, 83, 0.6);
          font: 500 0.75rem ui-monospace, monospace;
          letter-spacing: 0.08em;
          transform: translateY(-0.1em);
        }
        [data-gp-content] [data-wimah-badge] {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(245, 243, 238, 0.08);
          border: 1px solid rgba(245, 243, 238, 0.1);
          font-size: 12px;
          color: rgba(245, 243, 238, 0.7);
          letter-spacing: 0.02em;
        }
        [data-gp-content] [data-wimah-badge-dot] {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7c8472;
        }
        @container (min-width: 768px) {
          [data-gp-content] [data-wimah-features] {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 3.5rem;
          }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          width: "min(100%, 80rem)",
          margin: "auto",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "clamp(1.5rem, 4svh, 3rem)",
        }}
      >
        <div data-wimah-badge>
          <span data-wimah-badge-dot />
          Undangan digital Indonesia
        </div>
        <h2>Wimah membantu Anda membuat undangan digital yang indah.</h2>
        <div data-wimah-divider />
        <p>
          Pilih template, kustomisasi dengan mudah, dan bagikan undangan Anda
          dengan custom domain. Tanpa ribet, tanpa biaya tersembunyi.
        </p>
        <div data-wimah-features>
          <div data-wimah-feature>
            <h3>
              <span data-wimah-no>01</span>Pilih template
            </h3>
            <p>
              Mulai dengan template premium yang dirancang khusus untuk pernikahan
              dan acara spesial.
            </p>
          </div>
          <div data-wimah-feature>
            <h3>
              <span data-wimah-no>02</span>Kustomisasi
            </h3>
            <p>
              Ubah warna, teks, foto, dan detail acara sesuai keinginan Anda.
              Tanpa kode, tanpa ribet.
            </p>
          </div>
          <div data-wimah-feature>
            <h3>
              <span data-wimah-no>03</span>Bagikan
            </h3>
            <p>
              Kirim undangan via WhatsApp, SMS, atau bagikan link custom domain
              Anda sendiri.
            </p>
          </div>
        </div>
      </div>
    </GlyphPortal>
    </>
  );
}
