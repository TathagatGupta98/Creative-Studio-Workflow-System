import { useId } from 'react';

export default function BrandMark({ className = '' }) {
  const baseId = useId().replaceAll(':', '');
  const blueId = `sf-blue-${baseId}`;
  const redId = `sf-red-${baseId}`;
  const yellowId = `sf-yellow-${baseId}`;
  const greenId = `sf-green-${baseId}`;

  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      role="img"
      aria-label="StudioFlow logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={blueId} x1="34" y1="28" x2="80" y2="212" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4C86FF" />
          <stop offset="1" stopColor="#235AF7" />
        </linearGradient>
        <linearGradient id={redId} x1="98" y1="28" x2="214" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF634D" />
          <stop offset="1" stopColor="#F04B3C" />
        </linearGradient>
        <linearGradient id={yellowId} x1="98" y1="136" x2="214" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC847" />
          <stop offset="1" stopColor="#FFB31C" />
        </linearGradient>
        <linearGradient id={greenId} x1="68" y1="154" x2="132" y2="218" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#53D6A8" />
          <stop offset="1" stopColor="#2BCB9A" />
        </linearGradient>
      </defs>
      <rect x="34" y="28" width="46" height="184" fill={`url(#${blueId})`} />
      <path d="M98 28H182L214 60V124H98V28Z" fill={`url(#${redId})`} />
      <circle cx="140" cy="78" r="26" fill="#ffffff" />
      <path d="M98 136H214V216H98V176H156V160H98V136Z" fill={`url(#${yellowId})`} />
      <rect x="56" y="146" width="92" height="78" fill="#ffffff" />
      <rect x="68" y="158" width="68" height="54" fill={`url(#${greenId})`} />
      <path d="M124 183H174V173L198 194L174 215V205H124V183Z" fill="#ffffff" />
      <rect x="184" y="176" width="18" height="36" fill="#ffffff" />
    </svg>
  );
}