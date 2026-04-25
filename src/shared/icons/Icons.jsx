import React from 'react';

const common = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.75,
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/**
 * Inline SVG icons — no icon font / UI kit.
 * @param {{ name: string; size?: number; className?: string; label?: string }} props
 */
export function Icon({ name, size = 22, className = '', label, ...rest }) {
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  const svgProps = {
    ...common,
    width: size,
    height: size,
    className,
    ...a11y,
    ...rest,
  };

  switch (name) {
    case 'logo-shirt':
      return (
        <svg {...svgProps}>
          <path d="M6 4h3l1.5 2h3L15 4h3l3 4v14H3V8l3-4z" />
          <path d="M9 8h6M9 12h6" strokeWidth={1.25} />
        </svg>
      );
    case 'logo-device':
      return (
        <svg {...svgProps}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M10 19h4" strokeWidth={1.5} />
        </svg>
      );
    case 'home':
      return (
        <svg {...svgProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'user':
      return (
        <svg {...svgProps}>
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...svgProps}>
          <path d="M3 5v6l9 9 9-9V5H3Z" />
          <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'shirt':
      return (
        <svg {...svgProps}>
          <path d="M6 4h3l1.5 2h3L15 4h3l3 4v14H3V8l3-4z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...svgProps}>
          <path d="M9 3 8 8l-5 1 5 1 1 5 1-5 5-1-5-1-1-5Z" />
          <path d="M16 13l-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3Z" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...svgProps}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...svgProps}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...svgProps}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'star':
      return (
        <svg {...svgProps}>
          <path d="M12 2l2.9 7.3L22 9.3l-5.8 4.7L18.2 22 12 17.8 5.8 22l2-8L2 9.3l7.1-.1L12 2z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...svgProps}>
          <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <path d="M3 4h2l1 12h12l2-9H6" />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
