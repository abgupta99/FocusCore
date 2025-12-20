import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'focus_streak';
const LAST_DATE_KEY = 'last_focus_date';

export async function updateStreak() {
  const today = new Date().toDateString();

  const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
  let streak = parseInt(await AsyncStorage.getItem(STREAK_KEY) || '0', 10);

  if (lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  await AsyncStorage.setItem(STREAK_KEY, streak.toString());
  await AsyncStorage.setItem(LAST_DATE_KEY, today);

  return streak;
}

export async function getStreak() {
  return parseInt(await AsyncStorage.getItem(STREAK_KEY) || '0', 10);
}

export default {
  updateStreak,
  getStreak,
};
