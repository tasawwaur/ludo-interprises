export const typography = {
  h1: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 900,
    letterSpacing: '0.05em',
  },
  h2: {
    fontSize: '26px',
    lineHeight: '34px',
    fontWeight: 900,
    letterSpacing: '0.04em',
  },
  h3: {
    fontSize: '22px',
    lineHeight: '30px',
    fontWeight: 800,
    letterSpacing: '0.02em',
  },
  title: {
    fontSize: '18px',
    lineHeight: '26px',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
  body: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 600,
    letterSpacing: '0em',
  },
  caption: {
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    letterSpacing: '0em',
  },
  small: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
} as const;

export type TypographyToken = keyof typeof typography;
