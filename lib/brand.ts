// Nome dell'app in un solo posto. Il dominio dell'email finta in cloud.ts resta @mylife.app (cambiarlo romperebbe gli account esistenti).
export const BRAND = { a: 'Aqua', b: 'Macro', title: 'AquaMacro', tagline: 'Acqua. Calorie. Macro.' } as const;
export const BASE = process.env.NEXT_PUBLIC_BASE ?? '';
