// Every SVG from the Addy design, kept as-is so the visual language is
// unchanged. All are decorative unless a label is passed.

export function Logo({ size = 40, alt = "Addy" }) {
  return (
    <img
      src="/addy-logo.png"
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: Math.round(size * 0.18),
        display: "block",
        background: "#000",
      }}
    />
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const ChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <polyline points="9,3 4,8 9,13" {...stroke} />
  </svg>
);

export const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <polyline points="7,3 12,8 7,13" {...stroke} />
  </svg>
);

export const ChevronUp = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <polyline points="12,10 8,5 4,10" {...stroke} />
  </svg>
);

export const ChevronDown = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <polyline points="4,6 8,11 12,6" {...stroke} />
  </svg>
);

export const Search = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Streak = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5 L12 8 L8 14.5 L4 8 Z" fill="var(--warn)" />
  </svg>
);

export const Check = ({ size = 16, color = "currentColor", width = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <polyline
      points="3,8.5 6.5,12 13,4.5"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Warn = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.2" fill="none" stroke={color} strokeWidth="1.6" />
    <line x1="8" y1="4.6" x2="8" y2="8.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="8" cy="11.2" r="1" fill={color} />
  </svg>
);

export const Info = ({ size = 16, color = "var(--sage)" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.2" fill="none" stroke={color} strokeWidth="1.6" />
    <circle cx="8" cy="5.2" r="1" fill={color} />
    <line x1="8" y1="7.5" x2="8" y2="11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Clock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <polyline points="7,4 7,7 9,8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Plus = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const Close = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const Play = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" />
  </svg>
);

export const Pause = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <rect x="2" y="1.5" width="3.5" height="11" fill="currentColor" />
    <rect x="8.5" y="1.5" width="3.5" height="11" fill="currentColor" />
  </svg>
);

export const Target = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);

export const Speaker = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 6 h3 l4 -3 v10 l-4 -3 h-3 z" fill="currentColor" />
    <path d="M12 5.5 a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Lines = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <line x1="2.5" y1="4" x2="13.5" y2="4" {...stroke} />
    <line x1="2.5" y1="8" x2="13.5" y2="8" {...stroke} />
    <line x1="2.5" y1="12" x2="9.5" y2="12" {...stroke} />
  </svg>
);

export const Link = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.5 9.5 a3 3 0 0 0 4.2 0 l1.8 -1.8 a3 3 0 0 0 -4.2 -4.2 l-0.9 0.9" {...stroke} />
    <path d="M9.5 6.5 a3 3 0 0 0 -4.2 0 l-1.8 1.8 a3 3 0 0 0 4.2 4.2 l0.9 -0.9" {...stroke} />
  </svg>
);

export const Upload = ({ size = 34, color = "var(--clay)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 16 V4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <polyline points="7,9 12,4 17,9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16 v3 a1 1 0 0 0 1 1 h14 a1 1 0 0 0 1 -1 v-3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FlowArrow = () => (
  <svg width="18" height="34" viewBox="0 0 18 34" aria-hidden="true">
    <line x1="9" y1="2" x2="9" y2="26" stroke="var(--border)" strokeWidth="2" />
    <polyline points="4,22 9,28 14,22" fill="none" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
