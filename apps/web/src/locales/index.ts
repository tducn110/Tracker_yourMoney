import vi from './vi.json';

export type LocaleTranslations = typeof vi;

// For now, we only support Vietnamese. 
// We can expand this to read from contexts or other JSONs later.
export function useTranslations() {
  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = vi;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Fallback to key if translation is missing
      }
    }
    return result as string;
  };

  return { t };
}
