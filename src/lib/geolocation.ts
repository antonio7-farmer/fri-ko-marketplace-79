/**
 * Geolocation utilities
 */

import { EARTH_RADIUS_KM } from './constants';

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Validate that coordinates are valid numbers
 * @param lat - Latitude to validate
 * @param lng - Longitude to validate
 * @returns true if both are valid numbers
 */
export const isValidCoordinates = (lat: unknown, lng: unknown): lat is number & lng is number => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Safely parse coordinates from string or number
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns Coordinates object or null if invalid
 */
export const parseCoordinates = (
  lat: string | number | null | undefined,
  lng: string | number | null | undefined
): Coordinates | null => {
  if (lat == null || lng == null) return null;

  const parsedLat = typeof lat === 'number' ? lat : Number(lat);
  const parsedLng = typeof lng === 'number' ? lng : Number(lng);

  if (isValidCoordinates(parsedLat, parsedLng)) {
    return { lat: parsedLat, lng: parsedLng };
  }

  return null;
};
