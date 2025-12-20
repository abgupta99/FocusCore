import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import useTodos from '../hooks/useTodos';
import TodoInput from '../components/TodoInput';
import TodoList from '../components/TodoList';
import FocusMode from '../components/FocusMode';
import { updateStreak, getStreak } from '../utils/streak';
import useFocusMinutes from '../hooks/useFocusMinutes';

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'TODAY';
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';

  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();
};

export default function HomeScreen() {
  const { todos, add, toggle, remove } = useTodos();
  const today = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(today);
  const [focusTask, setFocusTask] = useState(null);
  const [streak, setStreak] = useState(0);
  const { addMinutes } = useFocusMinutes();

  useEffect(() => {
    getStreak().then(setStreak);
  }, []);

  // request notification permissions proactively on home screen mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: req } = await Notifications.requestPermissionsAsync();
          console.log('Notification permission requested:', req);
        } else {
          console.log('Notification permission already granted');
        }
      } catch (e) {
        console.warn('Notification permission error', e);
      }
    })();
  }, []);

  const visibleTodos = todos.filter(
    t => (t.createdDate || today) === selectedDate
  );
  const remaining = visibleTodos.filter(t => !t.completed).length;

  const go = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const addWithDate = (payload) =>
    add({ ...payload, createdDate: selectedDate });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DoOne</Text>
        <Text style={styles.subtitle}>
          {remaining} TASKS • 🔥 {streak} DAY STREAK
        </Text>
      </View>

      <View style={styles.inputWrap}>
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => go(-1)}
            accessibilityLabel="Previous day"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.chev}>{'‹'}</Text>
          </TouchableOpacity>

          <Text style={styles.dateLabel} accessibilityLabel={`Selected date ${getDateLabel(selectedDate)}`}>
            {getDateLabel(selectedDate)}
          </Text>

          <TouchableOpacity
            onPress={() => setSelectedDate(today)}
            style={styles.todayPill}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <Text style={styles.todayPillText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => go(1)}
            accessibilityLabel="Next day"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.chev, selectedDate === today && styles.chevDisabled]}>{'›'}</Text>
          </TouchableOpacity>
        </View>

        {!focusTask && <TodoInput onAdd={addWithDate} />}
      </View>

      <View style={styles.listWrap}>
        <TodoList
          todos={visibleTodos}
          onToggle={toggle}
          onRemove={remove}
          onFocus={setFocusTask}
        />
      </View>

      {focusTask && (
        <FocusMode
          task={focusTask}
          onExit={async (completed, minutes) => {
            if (completed) {
              toggle(focusTask.id);
              const s = await updateStreak();
              setStreak(s);
            }
            if (minutes && minutes > 0) {
              try {
                console.log('[FocusMinutes] adding', minutes, 'to', selectedDate);
                await addMinutes(selectedDate, minutes);
                console.log('[FocusMinutes] added');
              } catch (e) {
                console.warn('[FocusMinutes] add error', e);
              }
            }
            setFocusTask(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05070D' },
  header: {
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,240,255,0.15)',
    backgroundColor: '#070A14',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: '#E6F7FF',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    letterSpacing: 1.4,
    color: '#7A8FB3',
  },
  inputWrap: { padding: 14, backgroundColor: '#05070D' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateLabel: {
    color: '#E6F7FF',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  chev: {
    color: '#7A8FB3',
    paddingHorizontal: 8,
    fontSize: 20,
    fontWeight: '700',
  },
  chevDisabled: {
    opacity: 0.35,
  },
  todayPill: {
    backgroundColor: '#08101A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.08)'
  },
  todayPillText: {
    color: '#00F0FF',
    fontWeight: '800',
  },
  listWrap: { flex: 1 },
});
