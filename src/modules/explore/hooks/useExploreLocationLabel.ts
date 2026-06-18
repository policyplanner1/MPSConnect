import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'explore:lastLocationLabel';
const DEFAULT_LOCATION = 'Pune, Maharashtra, India';

type GeoPosition = {
  coords: { latitude: number; longitude: number };
};

function getCurrentPositionOnce(timeoutMs: number): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    const geo = (globalThis as any)?.navigator?.geolocation;
    if (!geo?.getCurrentPosition) {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    geo.getCurrentPosition(
      (pos: GeoPosition) => resolve(pos),
      (err: unknown) => reject(err),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
    );
  });
}

async function reverseGeocodeToLabel(lat: number, lon: number): Promise<string | null> {
  // Best-effort reverse geocode using OSM Nominatim (no API key). If it fails, keep fallback.
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    String(lat),
  )}&lon=${encodeURIComponent(String(lon))}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as any;
  const address = data?.address;
  const city = address?.city ?? address?.town ?? address?.village ?? address?.suburb;
  const state = address?.state;
  const country = address?.country;

  const parts = [city, state, country].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return parts.join(', ');
}

async function canUseGpsSilently(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS permission check without prompting needs a native permissions lib.
    // We keep it "silent" by not attempting GPS on iOS here.
    return false;
  }

  try {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  } catch {
    return false;
  }
}

export function useExploreLocationLabel() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && cached) {
          setLabel(cached);
        }
      } catch {
        // ignore
      }

      const hasGps = await canUseGpsSilently();
      if (!hasGps) {
        if (mounted && !label) {
          setLabel(null);
        }
        return;
      }

      try {
        const pos = await getCurrentPositionOnce(6500);
        const next = await reverseGeocodeToLabel(pos.coords.latitude, pos.coords.longitude);
        if (!next) {
          return;
        }
        if (mounted) {
          setLabel(next);
        }
        try {
          await AsyncStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };

    run();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return label ?? DEFAULT_LOCATION;
}

