/**
 * FatToFit Theme - Central Export
 * Import everything from here for consistent theming
 */

import colors from './colors';
import typography, { textStyles } from './typography';
import spacingModule, { spacing, borderRadius, sizes, layout, shadows } from './spacing';

// Combined theme object
const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  sizes,
  layout,
  shadows,
};

export {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  sizes,
  layout,
  shadows,
  theme as default,
};


