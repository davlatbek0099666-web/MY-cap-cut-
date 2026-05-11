import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  scissors: "M6 3a3 3 0 110 6 3 3 0 010-6zM18 15a3 3 0 110 6 3 3 0 010-6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12",
  split: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
  text: "M4 6h16M4 12h16M4 18h7",
  music: "M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  sticker: "M12 2a10 10 0 1010 10M12 12l8-8M15 5h4v4",
  blur: "M3 12h18M3 6h18M3 18h18",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  undo: "M3 7v6h6M3 13C4.5 8 9.5 5 15 5c5 0 8 3.5 8 7.5S20 20 15 20c-4 0-7.5-2-9-5",
  redo: "M21 7v6h-6M21 13C19.5 8 14.5 5 9 5c-5 0-8 3.5-8 7.5S4 20 9 20c4 0 7.5-2 9-5",
  export: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2",
  plus: "M12 5v14M5 12h14",
  close: "M18 6L6 18M6 6l12 12",
  chevronDown: "M6 9l6 6 6-6",
  volume: "M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07",
  speed: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  transition: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
  keyframe: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  chromakey: "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-18c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  telegram: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
};

// ─── Color Palette ────────────────────────────────────────────────────────────
const palette = {
  bg: "#070B14",
  surface: "#0D1220",
  panel: "#111827",
  card: "#141C2E",
  border: "rgba(56,139,253,0.15)",
  neon: "#38BDF8",
  neonGlow: "rgba(56,189,248,0.35)",
  neonDeep: "#0EA5E9",
  accent: "#6366F1",
  accentGlow: "rgba(99,102,241,0.3)",
  pink: "#EC4899",
  green: "#10B981",
  yellow: "#F59E0B",
  text: "#E2E8F0",
  textMuted: "#64748B",
  textDim: "#334155",
  glass: "rgba(13,18,32,0.85)",
  glassBorder: "rgba(56,139,253,0.2)",
};

// ─── Glassmorphism Panel ──────────────────────────────────────────────────────
const GlassPanel = ({ children, className = "", style = {}, onClick, animate = true }) => (
  <motion.div
    className={className}
    style={{
      background: `linear-gradient(135deg, rgba(17,24,39,0.92) 0%, rgba(13,18,32,0.96) 100%)`,
      backdropFilter: "blur(24px)",
      border: `1px solid ${palette.glassBorder}`,
      borderRadius: 16,
      ...style,
    }}
    initial={animate ? { opacity: 0, y: 10 } : false}
    animate={animate ? { opacity: 1, y: 0 } : false}
    transition={{ duration: 0.3 }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// ─── Neon Button ─────────────────────────────────────────────────────────────
const NeonBtn = ({ children, onClick, active, small, danger, accent, disabled, className = "" }) => {
  const color = danger ? palette.pink : accent ? palette.accent : palette.neon;
  const glow = danger ? "rgba(236,72,153,0.3)" : accent ? palette.accentGlow : palette.neonGlow;
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}22, ${color}11)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? color : palette.glassBorder}`,
        borderRadius: small ? 10 : 12,
        color: active ? color : palette.textMuted,
        padding: small ? "6px 12px" : "9px 18px",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s",
        boxShadow: active ? `0 0 14px ${glow}` : "none",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: "0.02em",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </motion.button>
  );
};

// ─── Tool Button ─────────────────────────────────────────────────────────────
const ToolBtn = ({ icon, label, active, onClick, badge }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.06, y: -1 }}
    whileTap={{ scale: 0.94 }}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 5,
      padding: "10px 8px",
      borderRadius: 14,
      border: `1px solid ${active ? palette.neon : "transparent"}`,
      background: active
        ? `linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.05))`
        : "rgba(255,255,255,0.02)",
      cursor: "pointer",
      color: active ? palette.neon : palette.textMuted,
      minWidth: 60,
      position: "relative",
      transition: "all 0.2s",
      boxShadow: active ? `0 0 12px ${palette.neonGlow}` : "none",
    }}
  >
    <Icon path={icons[icon]} size={18} color="currentColor" />
    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
      {label}
    </span>
    {badge && (
      <span style={{
        position: "absolute", top: 4, right: 4,
        background: palette.pink, borderRadius: "50%",
        width: 7, height: 7,
      }} />
    )}
  </motion.button>
);

// ─── Timeline Track ───────────────────────────────────────────────────────────
const TimelineTrack = ({ track, playhead, duration, onSelect, selected, onTrim }) => {
  const pct = (t) => `${(t / duration) * 100}%`;
  return (
    <div style={{ height: 44, position: "relative", display: "flex", alignItems: "center" }}>
      {/* Track label */}
      <div style={{
        width: 56, minWidth: 56, height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRight: `1px solid ${palette.border}`,
      }}>
        <Icon path={icons[track.type === "video" ? "layers" : track.type === "audio" ? "music" : "text"]}
          size={14} color={palette.textMuted} />
      </div>
      {/* Clip area */}
      <div style={{ flex: 1, height: "100%", position: "relative", overflow: "hidden" }}>
        {track.clips.map((clip, i) => (
          <motion.div
            key={i}
            onClick={() => onSelect(clip)}
            whileHover={{ brightness: 1.1 }}
            style={{
              position: "absolute",
              left: pct(clip.start),
              width: pct(clip.end - clip.start),
              top: 4, bottom: 4,
              borderRadius: 8,
              background: selected?.id === clip.id
                ? `linear-gradient(90deg, ${palette.neonDeep}, ${palette.accent})`
                : track.type === "video"
                  ? `linear-gradient(90deg, #1E3A5F, #1A2E4A)`
                  : track.type === "audio"
                    ? `linear-gradient(90deg, #1A3A2A, #153022)`
                    : `linear-gradient(90deg, #3A1E3A, #2A1530)`,
              border: `1px solid ${selected?.id === clip.id ? palette.neon : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer",
              display: "flex", alignItems: "center",
              padding: "0 8px", overflow: "hidden",
              boxShadow: selected?.id === clip.id ? `0 0 10px ${palette.neonGlow}` : "none",
              transition: "all 0.15s",
            }}
          >
            {track.type === "video" && (
              <div style={{ display: "flex", gap: 2, overflow: "hidden", width: "100%" }}>
                {[...Array(Math.ceil((clip.end - clip.start) / 2))].map((_, fi) => (
                  <div key={fi} style={{
                    width: 28, minWidth: 28, height: 28,
                    borderRadius: 4,
                    background: `hsl(${220 + fi * 5}, 40%, ${18 + fi % 3 * 3}%)`,
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            )}
            {track.type === "audio" && (
              <div style={{ display: "flex", gap: 1, alignItems: "center", overflow: "hidden", width: "100%" }}>
                {[...Array(40)].map((_, wi) => (
                  <div key={wi} style={{
                    width: 2, borderRadius: 1,
                    height: `${30 + Math.sin(wi * 0.8) * 20}%`,
                    background: `rgba(16,185,129,${0.4 + Math.sin(wi) * 0.4})`,
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            )}
            {track.type === "text" && (
              <span style={{ fontSize: 10, color: palette.text, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                {clip.content || "Text"}
              </span>
            )}
          </motion.div>
        ))}
        {/* Playhead */}
        <div style={{
          position: "absolute", left: pct(playhead), top: 0, bottom: 0,
          width: 2, background: palette.neon,
          boxShadow: `0 0 8px ${palette.neonGlow}`,
          pointerEvents: "none", zIndex: 10,
        }} />
      </div>
    </div>
  );
};

// ─── Export Modal ─────────────────────────────────────────────────────────────
const ExportModal = ({ onClose }) => {
  const [quality, setQuality] = useState("1080p");
  const [format, setFormat] = useState("mp4");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const startExport = () => {
    setExporting(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.min(p, 100));
    }, 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <GlassPanel style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: palette.text, fontFamily: "'DM Sans', sans-serif" }}>
            Export Video
          </span>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ background: "none", border: "none", cursor: "pointer", color: palette.textMuted }}>
            <Icon path={icons.close} size={20} color="currentColor" />
          </motion.button>
        </div>

        {!exporting ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: palette.textMuted, display: "block", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                Resolution
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["720p", "1080p", "4K"].map(q => (
                  <NeonBtn key={q} active={quality === q} small onClick={() => setQuality(q)}>
                    {q}
                  </NeonBtn>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: palette.textMuted, display: "block", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                Format
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["mp4", "mov", "webm"].map(f => (
                  <NeonBtn key={f} active={format === f} small onClick={() => setFormat(f)}>
                    {f.toUpperCase()}
                  </NeonBtn>
                ))}
              </div>
            </div>
            <div style={{
              padding: "12px 16px",
              background: "rgba(56,189,248,0.05)",
              border: `1px solid ${palette.border}`,
              borderRadius: 12, marginBottom: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: palette.textMuted, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                <span>Estimated size</span>
                <span style={{ color: palette.neon }}>{quality === "4K" ? "~2.4 GB" : quality === "1080p" ? "~820 MB" : "~380 MB"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: palette.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                <span>Est. time</span>
                <span style={{ color: palette.neon }}>{quality === "4K" ? "~8 min" : quality === "1080p" ? "~3 min" : "~1 min"}</span>
              </div>
            </div>
            <motion.button
              onClick={startExport}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "14px",
                background: `linear-gradient(135deg, ${palette.neonDeep}, ${palette.accent})`,
                border: "none", borderRadius: 14,
                color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: "pointer", letterSpacing: "0.04em",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 24px ${palette.neonGlow}`,
              }}
            >
              Export {quality} {format.toUpperCase()}
            </motion.button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `conic-gradient(${palette.neon} ${progress * 3.6}deg, rgba(56,189,248,0.1) 0deg)`,
              margin: "0 auto 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: palette.surface,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: palette.neon,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {Math.round(progress)}%
              </div>
            </div>
            <p style={{ color: palette.text, fontWeight: 600, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
              {progress < 100 ? "Exporting..." : "Export Complete!"}
            </p>
            <p style={{ color: palette.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              {progress < 100 ? `Processing ${quality} video with FFmpeg` : "Your video is ready to share!"}
            </p>
            {progress >= 100 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClose}
                style={{
                  marginTop: 20, padding: "12px 32px",
                  background: `linear-gradient(135deg, ${palette.green}, #059669)`,
                  border: "none", borderRadius: 12,
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Done
              </motion.button>
            )}
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
};

// ─── Properties Panel ─────────────────────────────────────────────────────────
const PropertiesPanel = ({ selectedClip, activeTool }) => {
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [opacity, setOpacity] = useState(100);

  const Slider = ({ label, value, min, max, step = 1, onChange, unit = "", color = palette.neon }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: palette.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 11, color: color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <div style={{ position: "relative", height: 4, background: palette.border, borderRadius: 2 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${((value - min) / (max - min)) * 100}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 2,
          boxShadow: `0 0 8px ${color}44`,
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", margin: 0 }} />
      </div>
    </div>
  );

  const sections = {
    trim: (
      <div>
        <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
          Drag clip edges on timeline to trim
        </p>
        <Slider label="Speed" value={speed} min={0.25} max={4} step={0.25} onChange={setSpeed} unit="x" color={palette.accent} />
        <Slider label="Opacity" value={opacity} min={0} max={100} onChange={setOpacity} unit="%" />
      </div>
    ),
    music: (
      <div>
        <Slider label="Volume" value={volume} min={0} max={100} onChange={setVolume} unit="%" />
        <Slider label="Fade In" value={0} min={0} max={5} onChange={() => {}} unit="s" color={palette.green} />
        <Slider label="Fade Out" value={0} min={0} max={5} onChange={() => {}} unit="s" color={palette.pink} />
      </div>
    ),
    filter: (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {["None", "Vivid", "Matte", "Fade", "B&W", "Warm", "Cool", "Vintage", "Cinematic"].map(f => (
            <motion.button key={f}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: "8px 4px",
                background: f === "None" ? `rgba(56,189,248,0.1)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${f === "None" ? palette.neon : palette.border}`,
                borderRadius: 8, cursor: "pointer",
                color: f === "None" ? palette.neon : palette.textMuted,
                fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>
              {f}
            </motion.button>
          ))}
        </div>
        <Slider label="Intensity" value={75} min={0} max={100} onChange={() => {}} unit="%" />
      </div>
    ),
    text: (
      <div>
        <input
          placeholder="Enter text..."
          style={{
            width: "100%", padding: "10px 12px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${palette.border}`,
            borderRadius: 10, color: palette.text,
            fontSize: 13, outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 12, boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {["Aa Bold", "Aa Italic", "Aa Serif", "Aa Mono"].map(s => (
            <NeonBtn key={s} small active={s === "Aa Bold"}>{s}</NeonBtn>
          ))}
        </div>
        <Slider label="Size" value={32} min={12} max={120} onChange={() => {}} unit="px" />
        <Slider label="Opacity" value={100} min={0} max={100} onChange={setOpacity} unit="%" />
      </div>
    ),
    sticker: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {["🔥", "⚡", "💎", "🌟", "❤️", "🎵", "🎯", "✨", "🚀", "💫", "🎉", "🌈"].map(s => (
          <motion.button key={s}
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            style={{
              fontSize: 24, padding: 8,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${palette.border}`,
              borderRadius: 10, cursor: "pointer",
            }}>
            {s}
          </motion.button>
        ))}
      </div>
    ),
    transition: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {["Fade", "Slide", "Zoom", "Wipe", "Glitch", "Dissolve"].map(t => (
          <motion.button key={t}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: "10px",
              background: t === "Fade" ? `rgba(56,189,248,0.1)` : "rgba(255,255,255,0.03)",
              border: `1px solid ${t === "Fade" ? palette.neon : palette.border}`,
              borderRadius: 10, cursor: "pointer",
              color: t === "Fade" ? palette.neon : palette.textMuted,
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>
            {t}
          </motion.button>
        ))}
        <Slider label="Duration" value={0.5} min={0.1} max={2} step={0.1} onChange={() => {}} unit="s" color={palette.accent} />
      </div>
    ),
  };

  return (
    <div style={{ padding: "16px 12px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {sections[activeTool] || (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: palette.textDim, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Select a tool to edit properties
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function VideoEditor() {
  const [hasProject, setHasProject] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(4.2);
  const [activeTool, setActiveTool] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [undoStack, setUndoStack] = useState(3);
  const [redoStack, setRedoStack] = useState(0);
  const [selectedClip, setSelectedClip] = useState(null);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [currentTime, setCurrentTime] = useState("00:00:04");
  const duration = 30;
  const previewRef = useRef();
  const playTimerRef = useRef();

  const tracks = [
    {
      id: 1, type: "video", label: "Video 1",
      clips: [
        { id: "v1", start: 0, end: 12, label: "Clip 1" },
        { id: "v2", start: 13, end: 24, label: "Clip 2" },
      ],
    },
    {
      id: 2, type: "video", label: "Overlay",
      clips: [{ id: "v3", start: 6, end: 14, label: "Overlay" }],
    },
    {
      id: 3, type: "audio", label: "Music",
      clips: [{ id: "a1", start: 0, end: 28, label: "Background Music" }],
    },
    {
      id: 4, type: "text", label: "Captions",
      clips: [
        { id: "t1", start: 2, end: 7, content: "Hello World" },
        { id: "t2", start: 16, end: 22, content: "Subscribe!" },
      ],
    },
  ];

  useEffect(() => {
    if (playing) {
      playTimerRef.current = setInterval(() => {
        setPlayhead(p => {
          const next = p + 0.1;
          if (next >= duration) { setPlaying(false); return 0; }
          const s = Math.floor(next);
          const m = Math.floor(s / 60);
          setCurrentTime(`${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(Math.floor((next % 1) * 100)).padStart(2, "0")}`);
          return next;
        });
      }, 100);
    }
    return () => clearInterval(playTimerRef.current);
  }, [playing]);

  const tools = [
    { id: "trim", icon: "scissors", label: "Trim" },
    { id: "split", icon: "split", label: "Split" },
    { id: "transition", icon: "transition", label: "Trans." },
    { id: "text", icon: "text", label: "Text" },
    { id: "music", icon: "music", label: "Music" },
    { id: "filter", icon: "filter", label: "Filter" },
    { id: "sticker", icon: "sticker", label: "Sticker" },
    { id: "speed", icon: "speed", label: "Speed" },
    { id: "keyframe", icon: "keyframe", label: "Keyframe" },
    { id: "chromakey", icon: "chromakey", label: "Green Sc." },
    { id: "blur", icon: "blur", label: "Blur" },
    { id: "layers", icon: "layers", label: "Layers" },
  ];

  if (!hasProject) {
    return (
      <div style={{
        minHeight: "100vh", background: palette.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${palette.bg}; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${palette.border}; border-radius: 4px; }
          input[type=range] { -webkit-appearance: none; height: 4px; background: transparent; }
          input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${palette.neon}; cursor: pointer; box-shadow: 0 0 8px ${palette.neonGlow}; }
        `}</style>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)`,
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "10%",
            width: 300, height: 300, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)`,
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 420, textAlign: "center" }}
        >
          {/* Logo */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: `linear-gradient(135deg, ${palette.neonDeep}, ${palette.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 0 40px ${palette.neonGlow}, 0 0 80px rgba(99,102,241,0.2)`,
            }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.553A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" fill="white" />
            </svg>
          </motion.div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: palette.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
            VidCut Pro
          </h1>
          <p style={{ color: palette.textMuted, fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Professional video editor for Telegram<br />
            <span style={{ color: palette.neon }}>CapCut-level</span> editing on mobile
          </p>

          {/* Upload Zone */}
          <motion.div
            whileHover={{ scale: 1.02, borderColor: palette.neon }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setHasProject(true)}
            style={{
              border: `2px dashed rgba(56,189,248,0.3)`,
              borderRadius: 20, padding: "40px 24px",
              cursor: "pointer", marginBottom: 20,
              background: `linear-gradient(135deg, rgba(56,189,248,0.04), rgba(99,102,241,0.04))`,
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(56,189,248,0.1)",
              border: `1px solid rgba(56,189,248,0.2)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <Icon path={icons.upload} size={24} color={palette.neon} />
            </div>
            <p style={{ color: palette.text, fontWeight: 600, marginBottom: 6 }}>
              Upload Video
            </p>
            <p style={{ color: palette.textMuted, fontSize: 12 }}>
              MP4, MOV, AVI up to 4K
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setHasProject(true)}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${palette.border}`,
                borderRadius: 14, color: palette.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              📂 Open Project
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setHasProject(true)}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${palette.border}`,
                borderRadius: 14, color: palette.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ✨ Templates
            </motion.button>
          </div>

          {/* Feature Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["Multi-layer", "4K Export", "Transitions", "Green Screen", "Keyframes", "Auto Captions"].map(f => (
              <span key={f} style={{
                padding: "5px 12px",
                background: "rgba(56,189,248,0.06)",
                border: `1px solid rgba(56,189,248,0.15)`,
                borderRadius: 20, fontSize: 11,
                color: palette.textMuted, fontWeight: 500,
              }}>
                {f}
              </span>
            ))}
          </div>

          <p style={{ color: palette.textDim, fontSize: 11, marginTop: 24 }}>
            <Icon path={icons.telegram} size={12} color={palette.neon} /> Connected as @YourUsername
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", background: palette.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${palette.border}; border-radius: 4px; }
        input[type=range] { -webkit-appearance: none; height: 4px; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${palette.neon}; cursor: pointer; box-shadow: 0 0 8px ${palette.neonGlow}; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        height: 52, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 12px",
        borderBottom: `1px solid ${palette.border}`,
        background: `rgba(7,11,20,0.97)`,
        backdropFilter: "blur(20px)",
        flexShrink: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${palette.neonDeep}, ${palette.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 12px ${palette.neonGlow}`,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.553A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: palette.text, letterSpacing: "-0.01em" }}>
            VidCut <span style={{ color: palette.neon }}>Pro</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NeonBtn small onClick={() => setUndoStack(u => Math.max(0, u - 1))} disabled={undoStack === 0}>
            <Icon path={icons.undo} size={14} color="currentColor" /> Undo
          </NeonBtn>
          <NeonBtn small onClick={() => setRedoStack(r => Math.max(0, r - 1))} disabled={redoStack === 0}>
            <Icon path={icons.redo} size={14} color="currentColor" /> Redo
          </NeonBtn>
          <NeonBtn small>
            <Icon path={icons.save} size={14} color="currentColor" />
          </NeonBtn>
          <motion.button
            onClick={() => setShowExport(true)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              background: `linear-gradient(135deg, ${palette.neonDeep}, ${palette.accent})`,
              border: "none", borderRadius: 10, padding: "7px 14px",
              color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: `0 0 14px ${palette.neonGlow}`,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Icon path={icons.export} size={13} color="white" /> Export
          </motion.button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* Left Tool Panel */}
        <div style={{
          width: 68, flexShrink: 0,
          borderRight: `1px solid ${palette.border}`,
          background: palette.surface,
          display: "flex", flexDirection: "column",
          alignItems: "center", padding: "8px 4px",
          gap: 4, overflowY: "auto",
        }}>
          {tools.map(t => (
            <ToolBtn
              key={t.id}
              icon={t.icon}
              label={t.label}
              active={activeTool === t.id}
              onClick={() => {
                setActiveTool(activeTool === t.id ? null : t.id);
                setShowRightPanel(true);
              }}
            />
          ))}
        </div>

        {/* Center: Preview + Timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* Preview Player */}
          <div style={{
            flex: 1, minHeight: 0,
            background: "#000",
            position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Video Canvas */}
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #081522 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              {/* Simulated video content */}
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at center, rgba(56,189,248,0.08) 0%, transparent 70%)`,
              }} />
              <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: "min(280px, 80%)", aspectRatio: "16/9",
                  borderRadius: 8,
                  background: `linear-gradient(135deg, #1a2a4a, #0f1e36)`,
                  border: `1px solid rgba(56,189,248,0.15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(45deg, transparent 30%, rgba(56,189,248,0.03) 50%, transparent 70%)`,
                }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                  <p style={{ color: palette.textMuted, fontSize: 11, fontWeight: 600 }}>
                    Preview
                  </p>
                </div>
                {/* Text overlay preview */}
                {playhead >= 2 && playhead <= 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute", bottom: 16, left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(4px)",
                      padding: "4px 12px", borderRadius: 6,
                      color: "#fff", fontSize: 12, fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Hello World
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Overlay Controls */}
            <div style={{
              position: "absolute", bottom: 12, left: "50%",
              transform: "translateX(-50%)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <GlassPanel animate={false} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px", borderRadius: 40,
              }}>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setPlayhead(0)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: palette.textMuted }}
                >
                  <Icon path="M19 20L9 12l10-8v16zM5 19V5" size={16} color="currentColor" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setPlaying(!playing)}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${palette.neonDeep}, ${palette.accent})`,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 16px ${palette.neonGlow}`,
                  }}
                >
                  <Icon path={playing ? icons.pause : icons.play} size={16} color="white" fill="white" />
                </motion.button>
                <span style={{ fontSize: 11, color: palette.neon, fontWeight: 700, minWidth: 60, fontFamily: "monospace" }}>
                  {currentTime}
                </span>
                <span style={{ fontSize: 11, color: palette.textMuted, fontFamily: "monospace" }}>
                  / 00:30:00
                </span>
              </GlassPanel>
            </div>

            {/* Format badge */}
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
              border: `1px solid ${palette.border}`, borderRadius: 8,
              padding: "4px 8px", fontSize: 10, color: palette.neon,
              fontWeight: 700, letterSpacing: "0.04em",
            }}>
              9:16 VERTICAL
            </div>

            {/* Aspect ratio toggle */}
            <div style={{
              position: "absolute", top: 10, left: 10,
              display: "flex", gap: 4,
            }}>
              {["16:9", "9:16", "1:1", "4:3"].map(r => (
                <motion.button key={r}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    background: r === "9:16" ? `rgba(56,189,248,0.15)` : "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${r === "9:16" ? palette.neon : palette.border}`,
                    borderRadius: 6, padding: "3px 7px",
                    color: r === "9:16" ? palette.neon : palette.textMuted,
                    fontSize: 9, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Timeline ── */}
          <div style={{
            background: palette.surface,
            borderTop: `1px solid ${palette.border}`,
            flexShrink: 0,
          }}>
            {/* Timeline Toolbar */}
            <div style={{
              height: 38, display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 10px",
              borderBottom: `1px solid ${palette.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <NeonBtn small onClick={() => {}} accent>
                  <Icon path={icons.plus} size={12} color="currentColor" /> Add
                </NeonBtn>
                {selectedClip && (
                  <>
                    <NeonBtn small onClick={() => {}}>
                      <Icon path={icons.scissors} size={12} color="currentColor" /> Trim
                    </NeonBtn>
                    <NeonBtn small onClick={() => {}}>
                      <Icon path={icons.split} size={12} color="currentColor" /> Split
                    </NeonBtn>
                    <NeonBtn small danger onClick={() => setSelectedClip(null)}>
                      <Icon path={icons.trash} size={12} color="currentColor" />
                    </NeonBtn>
                  </>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: palette.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Zoom</span>
                <NeonBtn small onClick={() => setTimelineZoom(z => Math.min(z + 0.5, 4))}>+</NeonBtn>
                <NeonBtn small onClick={() => setTimelineZoom(z => Math.max(z - 0.5, 0.5))}>−</NeonBtn>
              </div>
            </div>

            {/* Timecode ruler */}
            <div style={{
              height: 20, display: "flex",
              paddingLeft: 56, position: "relative",
              borderBottom: `1px solid ${palette.border}`,
              overflow: "hidden",
            }}>
              {[...Array(31)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: `calc(56px + ${(i / duration) * 100}%)`,
                  top: 0, bottom: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-start",
                }}>
                  <div style={{ width: 1, height: i % 5 === 0 ? 10 : 5, background: i % 5 === 0 ? palette.textDim : "rgba(100,116,139,0.3)" }} />
                  {i % 5 === 0 && (
                    <span style={{ fontSize: 8, color: palette.textDim, fontFamily: "monospace", marginTop: 1 }}>
                      {String(Math.floor(i / 60)).padStart(2, "0")}:{String(i % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Tracks */}
            <div style={{ overflowY: "auto", maxHeight: 185 }}>
              {tracks.map(track => (
                <div key={track.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                  <TimelineTrack
                    track={track}
                    playhead={playhead}
                    duration={duration}
                    onSelect={setSelectedClip}
                    selected={selectedClip}
                  />
                </div>
              ))}
              {/* Add track button */}
              <motion.button
                whileHover={{ background: "rgba(56,189,248,0.06)" }}
                style={{
                  width: "100%", height: 36,
                  display: "flex", alignItems: "center",
                  gap: 8, paddingLeft: 68,
                  background: "transparent", border: "none",
                  cursor: "pointer", color: palette.textMuted,
                  fontSize: 11, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <Icon path={icons.plus} size={12} color="currentColor" />
                Add Track
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {activeTool && showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flexShrink: 0, overflow: "hidden",
                borderLeft: `1px solid ${palette.border}`,
                background: palette.surface,
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{
                height: 38, display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0 12px",
                borderBottom: `1px solid ${palette.border}`,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: palette.text, textTransform: "capitalize", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
                  {activeTool}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveTool(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: palette.textMuted }}
                >
                  <Icon path={icons.close} size={14} color="currentColor" />
                </motion.button>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <PropertiesPanel selectedClip={selectedClip} activeTool={activeTool} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Status Bar ── */}
      <div style={{
        height: 28, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 14px",
        borderTop: `1px solid ${palette.border}`,
        background: "rgba(7,11,20,0.97)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 9, color: palette.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
            {tracks.length} tracks · {tracks.reduce((a, t) => a + t.clips.length, 0)} clips
          </span>
          <div style={{ width: 1, height: 10, background: palette.border }} />
          <span style={{ fontSize: 9, color: palette.green, fontFamily: "'DM Sans', sans-serif" }}>
            ● Autosaved
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, color: palette.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
            1920×1080 · 30fps
          </span>
          <div style={{ width: 1, height: 10, background: palette.border }} />
          <span style={{ fontSize: 9, color: palette.neon, fontFamily: "'DM Sans', sans-serif" }}>
            <Icon path={icons.telegram} size={10} color={palette.neon} /> @YourUsername
          </span>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </AnimatePresence>
    </div>
  );
}
