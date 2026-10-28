import { Inter, Noto_Sans_Armenian, Noto_Serif_Armenian, Playfair_Display } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// Playfair and Inter have no Armenian letters. These cover only Armenian characters
// (by unicode-range), so they're placed first in the font stack and download only
// on pages with Armenian text. No metric fallback, or it would capture Latin text too.
export const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-armenian",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const notoSerifArmenian = Noto_Serif_Armenian({
  subsets: ["armenian"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-armenian",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const fontVariables = [playfair, inter, notoSansArmenian, notoSerifArmenian].map((f) => f.variable).join(" ");
