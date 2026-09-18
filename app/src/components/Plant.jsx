const LEAF_POS = [
  { cx: 53, cy: 104, rot: "rotate(-20 53 104)" },
  { cx: 97, cy: 88, rot: "rotate(20 97 88)" },
  { cx: 53, cy: 72, rot: "rotate(-20 53 72)" },
  { cx: 97, cy: 58, rot: "rotate(20 97 58)" },
  { cx: 53, cy: 48, rot: "rotate(-20 53 48)" },
];

export default function Plant({ leaves = 0, bloomed = false }) {
  return (
    <svg
      width="150"
      height="170"
      viewBox="0 0 150 170"
      role="img"
      aria-label="Your plant grows a leaf with each correct answer"
    >
      <ellipse cx="75" cy="156" rx="40" ry="10" fill="var(--soft)" />
      <path d="M55 156 L62 118 h26 l7 38 z" fill="var(--clay)" opacity="0.85" />
      <line x1="75" y1="120" x2="75" y2="40" stroke="var(--sage)" strokeWidth="4" strokeLinecap="round" />
      {LEAF_POS.slice(0, Math.min(leaves, 5)).map((l) => (
        <ellipse
          key={`${l.cx}-${l.cy}`}
          className="anim-grow"
          cx={l.cx}
          cy={l.cy}
          rx="20"
          ry="9"
          fill="var(--sage)"
          transform={l.rot}
        />
      ))}
      {bloomed && <circle cx="75" cy="36" r="11" fill="var(--warn)" />}
    </svg>
  );
}

export function GardenPlant() {
  return (
    <svg width="80" height="90" viewBox="0 0 150 170" aria-hidden="true">
      <path d="M55 156 L62 118 h26 l7 38 z" fill="var(--clay)" opacity="0.85" />
      <line x1="75" y1="120" x2="75" y2="46" stroke="var(--sage)" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="53" cy="100" rx="20" ry="9" fill="var(--sage)" transform="rotate(-20 53 100)" />
      <ellipse cx="97" cy="82" rx="20" ry="9" fill="var(--sage)" transform="rotate(20 97 82)" />
      <circle cx="75" cy="42" r="11" fill="var(--warn)" />
    </svg>
  );
}
