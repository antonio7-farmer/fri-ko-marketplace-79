/**
 * Leaflet map utilities
 */

import L from 'leaflet';

/**
 * Fix for Leaflet default marker icon in Webpack/Vite builds
 * This should be called once before using Leaflet maps
 */
export const initializeLeafletIcons = () => {
  // Delete the default icon URL getter to force Leaflet to use imported icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};
