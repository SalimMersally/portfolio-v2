export type ColorMode = 'dark' | 'light';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';

export interface Theme {
  colorAccent?: string;
  colorBg?: string;
  colorSurface?: string;
  colorText?: string;
  colorTextMuted?: string;
  fontHeading?: string;
  fontBody?: string;
  fontMono?: string;
  defaultMode: ColorMode;
  borderRadius: BorderRadius;
  spacing: SpacingDensity;
}
