import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'focus_minutes_by_date';
const TARGET_KEY = 'focus_daily_target';

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('useFocusMinutes: read error', e);
    return {};
  }
}

async function writeAll(obj) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('useFocusMinutes: write error', e);
  }
}

// simple in-memory listeners for live updates
const _listeners = new Set();

function subscribe(cb) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

function _notify(all) {
  for (const cb of Array.from(_listeners)) {
    try { cb(all); } catch (e) { console.warn('useFocusMinutes: listener error', e); }
  }
}

export default function useFocusMinutes() {
  const getForDate = async (dateKey) => {
    const all = await readAll();
    return all[dateKey] || 0;
  };

  const getAll = async () => {
    return await readAll();
  };

  const getSum = async (options = {}) => {
    // options: { lastNDays: number }
    const all = await readAll();
    const entries = Object.entries(all).map(([key, mins]) => ({ key, mins }));
    if (options.lastNDays) {
      const today = new Date();
      const cutoff = new Date();
      cutoff.setDate(today.getDate() - (options.lastNDays - 1));
      const filtered = entries.filter(e => new Date(e.key) >= cutoff);
      return filtered.reduce((s, e) => s + (e.mins || 0), 0);
    }
    return entries.reduce((s, e) => s + (e.mins || 0), 0);
  };

  const addMinutes = async (dateKey, minutesToAdd) => {
    const all = await readAll();
    const prev = all[dateKey] || 0;
    all[dateKey] = prev + Math.max(0, Math.round(minutesToAdd));
    await writeAll(all);
    // notify listeners with fresh data
    _notify(all);
    return all[dateKey];
  };

  const getTarget = async () => {
    try {
      const raw = await AsyncStorage.getItem(TARGET_KEY);
      return raw ? parseInt(raw, 10) : 25;
    } catch (e) {
      return 25;
    }
  };

  const setTarget = async (minutes) => {
    try {
      await AsyncStorage.setItem(TARGET_KEY, String(minutes));
    } catch (e) {
      console.warn('useFocusMinutes: setTarget error', e);
    }
  };

  return { getForDate, addMinutes, getTarget, setTarget, getAll, getSum, subscribe };
}
