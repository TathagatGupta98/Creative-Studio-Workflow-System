import { useId } from 'react';

export default function BrandMark({ className = '' }) {
  const baseId = useId().replaceAll(':', '');
  const logoBgId = `sf-bg-${baseId}`;

  return (
    <svg
      className={className}
      viewBox="0 0 798 880"
      role="img"
      aria-label="StudioFlow logo"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={logoBgId} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width="798" height="880" fill={`url(#${logoBgId})`} />
      <path d="M61 73H256V515H144V820H61V73Z" fill="#2f29e8" />
      <path d="M301 73H613L735 199V432H301V73Z" fill="#ff4b4b" />
      <path d="M610 82L726 199H610V82Z" fill="#FFFFFF" />
      <circle cx="459" cy="258" r="98" fill="#FFFFFF" />
      <path d="M300 476H735V816H488V734H585V652H488V515H300V476Z" fill="#ffea00" />
      <path d="M487 653H617V615L705 694L617 773V734H487V653Z" fill="#FFFFFF" />
      <rect x="186" y="560" width="256" height="256" fill="#00ff9d" />
    </svg>
  );
}