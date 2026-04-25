/**
 * 🎨 UI CONSTANTS & DESIGN TOKENS (Antigravity V1.2)
 * All values follow the 8pt Grid System.
 */

export const LAYOUT_CONSTANTS = {
  CONTAINER_WIDTH: 1200,
  COLUMN_COUNT: 12,
  GUTTER: 24, // 3 * 8
  MARGIN: 32, // 4 * 8
  BASE_UNIT: 8,
};

export type MetricVariant = 'emerald' | 'red' | 'amber';

/**
 * Static mapping for Tailwind v4 to ensure JIT class generation.
 * DO NOT use dynamic string interpolation for these classes.
 */
export const METRIC_STYLES: Record<MetricVariant, { 
  bg: string; 
  text: string;
  iconBg: string;
  iconText: string;
}> = {
  emerald: {
    bg: "bg-white",
    text: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  red: {
    bg: "bg-white",
    text: "text-red-600",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
  },
  amber: {
    bg: "bg-white",
    text: "text-amber-600",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
};
