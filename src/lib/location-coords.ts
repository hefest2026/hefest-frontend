/**
 * Encodes an optional map pin into the free-text `location` field so the API
 * schema doesn't need to change: "Main Hall @42.6977,23.3219".
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const COORD_RE = /\s*@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\s*$/;

export function parseLocationCoords(location: string): LatLng | null {
  const match = location.match(COORD_RE);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

export function stripLocationCoords(location: string): string {
  return location.replace(COORD_RE, "");
}

export function withLocationCoords(
  location: string,
  coords: LatLng | null,
): string {
  const base = stripLocationCoords(location).trim();
  if (!coords) return base;
  return `${base} @${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
}
