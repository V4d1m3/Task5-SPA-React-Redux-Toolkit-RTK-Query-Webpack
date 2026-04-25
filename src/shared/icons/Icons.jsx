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
    case 'aisle-smartphone':
      return (
        <svg {...svgProps}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M10 19h4" strokeWidth={1.5} />
        </svg>
      );
    case 'aisle-laptop':
      return (
        <svg {...svgProps}>
          <rect x="5" y="4" width="14" height="11" rx="1" />
          <path d="M3 18h18" strokeWidth={1.75} />
          <path d="M4 16h16" strokeWidth={1.25} />
        </svg>
      );
    case 'aisle-tablet':
      return (
        <svg {...svgProps}>
          <rect x="6" y="3" width="12" height="16" rx="1.5" />
          <path d="M12 17h.01" strokeWidth={2} />
        </svg>
      );
    case 'aisle-accessories':
      return (
        <svg {...svgProps}>
          <path d="M5 14v2a2 2 0 0 0 2 2h1M19 14v2a2 2 0 0 1-2 2h-1" />
          <path d="M5 14a7 7 0 0 1 7-7 7 7 0 0 1 7 7" />
          <path d="M9 22v-4M15 22v-4" />
        </svg>
      );
    case 'aisle-car':
      return (
        <svg {...svgProps}>
          <path d="M3 17h18v-2l-2-5h-4l-2-4H9L7 10H5l-2 5v2Z" />
          <circle cx="7.5" cy="17" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="16.5" cy="17" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'aisle-motorcycle':
      return (
        <svg {...svgProps}>
          <circle cx="7" cy="16" r="3" />
          <circle cx="17" cy="16" r="3" />
          <path d="M4 16h3l3-8h4l2 4h3l2 4h3" />
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
