import React from 'react';

interface FarmSolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  useOfficialImage?: boolean;
}

export const FarmSolLogo: React.FC<FarmSolLogoProps> = ({
  size = 'md',
  showTagline = true,
  theme = 'light',
  className = '',
  useOfficialImage = true
}) => {
  const [imgError, setImgError] = React.useState(false);

  const dimensions = {
    sm: { width: 140, height: 140, emblemSize: 64 },
    md: { width: 220, height: 210, emblemSize: 110 },
    lg: { width: 280, height: 260, emblemSize: 140 },
    hero: { width: 340, height: 310, emblemSize: 170 }
  }[size];

  const primaryGreen = theme === 'dark' ? '#22c55e' : '#14532d';
  const brandTitleColor = theme === 'dark' ? '#ffffff' : '#0a3d24';
  const taglineColor = theme === 'dark' ? '#94a3b8' : '#334155';

  if (useOfficialImage && !imgError) {
    return (
      <div
        className={`farmsol-logo-container ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        <img
          src="/farmsol_logo.jpg"
          alt="FARMSOL Logo"
          onError={() => setImgError(true)}
          style={{
            width: dimensions.width,
            maxHeight: dimensions.height,
            objectFit: 'contain',
            borderRadius: 12
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`farmsol-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        userSelect: 'none'
      }}
    >
      {/* Emblem SVG */}
      <svg
        width={dimensions.emblemSize}
        height={dimensions.emblemSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 4px 10px rgba(20, 83, 45, 0.15))' }}
      >
        <defs>
          <radialGradient id="sunGradAdmin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          <linearGradient id="fieldGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="farmerGradAdmin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#092e18" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="92" stroke="#15803d" strokeWidth="6" fill="white" />
        <circle cx="100" cy="78" r="32" fill="url(#sunGradAdmin)" />

        <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
          <line x1="100" y1="36" x2="100" y2="42" />
          <line x1="72" y1="50" x2="77" y2="54" />
          <line x1="128" y1="50" x2="123" y2="54" />
          <line x1="60" y1="78" x2="66" y2="78" />
          <line x1="140" y1="78" x2="134" y2="78" />
        </g>

        <path d="M 16 115 C 45 100, 100 100, 184 115 L 184 150 C 140 185, 60 185, 16 150 Z" fill="url(#fieldGradAdmin)" />
        <path d="M 28 132 C 60 120, 120 120, 172 132" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M 45 150 C 75 142, 125 142, 155 150" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />

        <g fill="url(#farmerGradAdmin)">
          <path d="M 40 75 C 50 68, 85 68, 95 75 C 90 62, 45 62, 40 75 Z" />
          <ellipse cx="67" cy="72" rx="20" ry="5" />
          <circle cx="67" cy="79" r="10" />
          <path d="M 42 120 C 45 92, 60 90, 72 90 C 82 90, 92 98, 92 120 Z" />
          <path d="M 52 92 L 68 120" stroke="#ffffff" strokeWidth="2.5" opacity="0.4" />
        </g>

        <g fill="#f59e0b" stroke="#d97706" strokeWidth="0.8">
          <path d="M 120 135 C 130 110, 145 90, 155 60 C 153 65, 140 85, 122 135 Z" fill="#b45309" />
          <ellipse cx="148" cy="68" rx="6" ry="10" transform="rotate(25 148 68)" fill="#f59e0b" />
          <ellipse cx="138" cy="80" rx="6.5" ry="11" transform="rotate(-15 138 80)" fill="#fbbf24" />
          <ellipse cx="152" cy="85" rx="6" ry="11" transform="rotate(30 152 85)" fill="#f59e0b" />
          <ellipse cx="140" cy="98" rx="6.5" ry="11" transform="rotate(-20 140 98)" fill="#fbbf24" />
          <ellipse cx="153" cy="103" rx="6" ry="10" transform="rotate(35 153 103)" fill="#f59e0b" />
          <ellipse cx="140" cy="116" rx="6" ry="10" transform="rotate(-15 140 116)" fill="#fbbf24" />
        </g>

        <g fill="#16a34a">
          <path d="M 85 12 C 92 4, 100 2, 105 10 C 98 12, 90 16, 85 12 Z" />
          <path d="M 115 12 C 108 4, 100 2, 95 10 C 102 12, 110 16, 115 12 Z" />
          <path d="M 130 22 C 122 16, 115 12, 110 22 C 118 22, 124 24, 130 22 Z" />
          <path d="M 70 22 C 78 16, 85 12, 90 22 C 82 22, 76 24, 70 22 Z" />
        </g>

        <circle cx="100" cy="100" r="92" stroke="#15803d" strokeWidth="4" fill="none" />
      </svg>

      {/* Typography: FARMSOL */}
      <div style={{ marginTop: size === 'sm' ? 4 : 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: size === 'sm' ? '1.3rem' : size === 'md' ? '1.85rem' : size === 'lg' ? '2.3rem' : '2.8rem',
            letterSpacing: '1px',
            color: brandTitleColor,
            lineHeight: 1.1,
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          FARM
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            S
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', margin: '0 1px' }}>
              O
              <svg
                width={size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24}
                height={size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24}
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }}
              >
                <path d="M12 3C7 3 4 8 4 13C4 18 8 21 13 21C18 21 21 16 21 11C21 10 20 5 12 3Z" fill="#15803d" opacity="0.2" />
                <path d="M6 15C10 15 17 12 18 6C12 7 7 11 6 15Z" fill="#22c55e" />
              </svg>
            </span>
            L
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, width: '100%' }}>
        <span style={{ height: '1.5px', width: size === 'sm' ? '18px' : '28px', background: primaryGreen, opacity: 0.6 }} />
        <span
          style={{
            fontSize: size === 'sm' ? '0.62rem' : size === 'md' ? '0.78rem' : '0.9rem',
            fontWeight: 800,
            letterSpacing: '2.5px',
            color: primaryGreen,
            textTransform: 'uppercase'
          }}
        >
          FARMER SOLUTIONS
        </span>
        <span style={{ height: '1.5px', width: size === 'sm' ? '18px' : '28px', background: primaryGreen, opacity: 0.6 }} />
      </div>

      {showTagline && (
        <div style={{ marginTop: 4, fontSize: size === 'sm' ? '0.72rem' : size === 'md' ? '0.85rem' : '0.98rem', fontWeight: 600, color: taglineColor, letterSpacing: '0.2px' }}>
          Smart Procurement. Better Farming.
        </div>
      )}
    </div>
  );
};
