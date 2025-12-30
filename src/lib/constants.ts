/**
 * Application-wide constants
 */

export const CATEGORIES = [
  { value: 'all', label: 'Sve' },
  { value: 'voce', label: 'Voće' },
  { value: 'povrce', label: 'Povrće' },
  { value: 'meso', label: 'Meso' },
  { value: 'jaja', label: 'Jaja' },
  { value: 'mlijecni', label: 'Mliječni' },
  { value: 'ostalo', label: 'Ostalo' }
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];

/**
 * Default location (Zagreb, Croatia)
 */
export const DEFAULT_LOCATION = {
  lat: 45.815,
  lng: 15.9819
} as const;

/**
 * Earth's radius in kilometers for distance calculations
 */
export const EARTH_RADIUS_KM = 6371;
