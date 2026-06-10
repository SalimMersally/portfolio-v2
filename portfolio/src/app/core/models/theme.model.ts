export type ColorMode = 'dark' | 'light';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';

export interface Theme {
  accentHue?: number;
  accentChroma?: number;
  fontHeading?: string;
  fontBody?: string;
  fontMono?: string;
  defaultMode: ColorMode;
  borderRadius: BorderRadius;
  spacing: SpacingDensity;
}
