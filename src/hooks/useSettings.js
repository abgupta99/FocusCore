import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_KEY = 'settings_default_focus_time';
const SOUND_KEY = 'settings_default_sound';
const TARGET_KEY = 'settings_default_target';

// in-memory subscribers for settings changes
const _targetSubscribers = new Set();

export function subscribeDefaultTarget(fn) {
  _targetSubscribers.add(fn);
  return () => _targetSubscribers.delete(fn);
}

export async function getDefaultTime() {
  try {
    const raw = await AsyncStorage.getItem(TIME_KEY);
    return raw ? parseInt(raw, 10) : 25;
  } catch (e) {
    return 25;
  }
}

export async function setDefaultTime(minutes) {
  try {
    await AsyncStorage.setItem(TIME_KEY, String(minutes));
  } catch (e) {
    console.warn('useSettings: setDefaultTime error', e);
  }
}

export async function getDefaultSound() {
  try {
    const raw = await AsyncStorage.getItem(SOUND_KEY);
    return raw || 'none';
  } catch (e) {
    return 'none';
  }
}

export async function setDefaultSound(key) {
  try {
    await AsyncStorage.setItem(SOUND_KEY, key);
  } catch (e) {
    console.warn('useSettings: setDefaultSound error', e);
  }
}

export async function getDefaultTarget() {
  try {
    const raw = await AsyncStorage.getItem(TARGET_KEY);
    return raw ? parseInt(raw, 10) : 60;
  } catch (e) {
    return 60;
  }
}

export async function setDefaultTarget(minutes) {
  try {
    await AsyncStorage.setItem(TARGET_KEY, String(minutes));
    // notify subscribers
    try {
      _targetSubscribers.forEach((cb) => {
        try { cb(Number(minutes)); } catch (e) { /* ignore subscriber errors */ }
      });
    } catch (e) {}
  } catch (e) {
    console.warn('useSettings: setDefaultTarget error', e);
  }
}

export default function useSettings() {
  return { getDefaultTime, setDefaultTime, getDefaultSound, setDefaultSound, getDefaultTarget, setDefaultTarget, subscribeDefaultTarget };
}
