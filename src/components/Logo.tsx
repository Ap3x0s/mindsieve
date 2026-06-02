export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={{ width: size, height: size }}>
      <style>{`
        @keyframes ar1 { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes ar2 { from { transform:rotate(60deg); } to { transform:rotate(420deg); } }
        @keyframes ar3 { from { transform:rotate(-60deg); } to { transform:rotate(300deg); } }
        @keyframes ar-p { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.8); } }
        .ar1 { animation:ar1 3s linear infinite; transform-origin:16px 16px; }
        .ar2 { animation:ar2 3s linear infinite; transform-origin:16px 16px; }
        .ar3 { animation:ar3 3s linear infinite; transform-origin:16px 16px; }
        .ar-p { animation:ar-p 2s ease-in-out infinite; transform-origin:16px 16px; }
      `}</style>
      <defs>
        <radialGradient id="ar-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
          <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="var(--color-accent)" opacity="0.05" />
      <rect width="32" height="32" rx="7" fill="url(#ar-grad)" />
      <ellipse cx="16" cy="16" rx="12" ry="4" stroke="var(--color-accent)" strokeWidth="0.9" fill="none" className="ar1" opacity="0.5" />
      <ellipse cx="16" cy="16" rx="12" ry="4" stroke="var(--color-accent)" strokeWidth="0.9" fill="none" className="ar2" opacity="0.5" />
      <ellipse cx="16" cy="16" rx="12" ry="4" stroke="var(--color-accent)" strokeWidth="0.9" fill="none" className="ar3" opacity="0.5" />
      <circle cx="16" cy="16" r="3.5" fill="var(--color-accent)" className="ar-p" opacity="0.5" />
      <circle cx="16" cy="16" r="2" fill="var(--color-accent)" />
    </svg>
  )
}
