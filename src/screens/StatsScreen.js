import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import useFocusMinutes from '../hooks/useFocusMinutes';
import { getDefaultTarget, subscribeDefaultTarget } from '../hooks/useSettings';

/* 🧠 Focus benefit quotes */
const QUOTES = [
  'Deep focus beats long hours.',
  'Focus turns effort into results.',
  'One focused session can change a day.',
  'Clarity comes from single-tasking.',
  'Discipline creates freedom.',
];

 

const labelFor = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export default function StatsScreen() {
  const { getAll, getSum, subscribe } = useFocusMinutes();

  const [targetDefault, setTargetDefault] = useState(60);

  const [days, setDays] = useState([]);
  const [mode, setMode] = useState('today');
  const [total, setTotal] = useState(0);
  const [quote, setQuote] = useState('');

  const glow = useRef(new Animated.Value(0)).current;
  const quoteFade = useRef(new Animated.Value(0)).current;

  /* 🌌 Glow pulse */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  /* 🧠 Daily quote */
  useEffect(() => {
    const i = new Date().getDay() % QUOTES.length;
    setQuote(QUOTES[i]);
    Animated.timing(quoteFade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  /* Load focus data */
  useEffect(() => {
    let unsub;
    (async () => {
      const all = await getAll();
      const entries = Object.entries(all || {}).map(([key, mins]) => ({ key, mins }));
      entries.sort((a, b) => new Date(b.key) - new Date(a.key));
      setDays(entries);

      // load persisted daily target (fallback to 60)
      try {
        const t = await getDefaultTarget();
        if (t) setTargetDefault(t);
      } catch (e) {
        // ignore
      }

      // subscribe to changes so UI updates immediately when Settings changes
      const unsubTarget = subscribeDefaultTarget((v) => {
        if (v) setTargetDefault(v);
      });

  // no target; visual scale will be derived from data

      // subscribe to live updates
      if (!unsub && typeof subscribe === 'function') {
        unsub = subscribe((fresh) => {
          const arr = Object.entries(fresh || {}).map(([key, mins]) => ({ key, mins }));
          arr.sort((a, b) => new Date(b.key) - new Date(a.key));
          setDays(arr);
        });
      }
    })();

    return () => { if (unsub) unsub(); if (typeof unsubTarget === 'function') unsubTarget(); };
  }, []);

  /* Calculate totals */
  useEffect(() => {
    (async () => {
      if (mode === 'today') {
        const today = new Date().toISOString().slice(0, 10);
        const all = await getAll();
        setTotal(all?.[today] || 0);
      } else if (mode === '7') {
        setTotal(await getSum({ lastNDays: 7 }));
      } else {
        setTotal(await getSum());
      }
    })();
  }, [mode, days]);

  const recent =
    mode === 'today'
      ? days.slice(0, 1)
      : mode === '7'
      ? days.slice(0, 7)
      : days;

  // use persisted or fallback target
  const score = Math.min(total / (targetDefault || 60), 1);

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1 + score * 0.1],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25 + score * 0.35, 0.5 + score * 0.6],
  });

  return (
    <View style={styles.container}>
      {/* 🧭 TOP HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.topTitle}>FOCUS STATS</Text>
      </View>

      {/* MODE SWITCH */}
      <View style={styles.modeRow}>
        {['today', '7', 'all'].map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeActive]}
          >
            <Text style={styles.modeText}>
              {m === 'today' ? 'Today' : m === '7' ? 'Last 7' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🧠 QUOTE */}
      <Animated.Text style={[styles.quote, { opacity: quoteFade }]}>
        “{quote}”
      </Animated.Text>

      {/* 🔥 FOCUS CORE */}
      <Animated.View
        style={[
          styles.coreWrap,
          { transform: [{ scale: glowScale }], shadowOpacity: glowOpacity },
        ]}
      >
        <View style={styles.coreInner}>
          <Text style={styles.coreValue}>{mode === 'today' ? `${total}/${targetDefault}` : `${total}`}</Text>
          <Text style={styles.coreUnit}>minutes</Text>
        </View>
  <Text style={styles.coreSub}>FOCUSED</Text>
  {mode === 'today' && <Text style={styles.coreTarget}>🎯 Target {targetDefault}m</Text>}
      </Animated.View>

      {/* 📜 HISTORY */}
      {(!recent || recent.length === 0) ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Start focusing to get your daily insights</Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
          renderItem={({ item }) => {
            const intensity = Math.min(item.mins / (targetDefault || 60), 1);
            return (
              <View style={styles.row}>
                <Text style={styles.day}>{labelFor(item.key)}</Text>
                <Text style={[styles.mins, { opacity: 0.6 + intensity * 0.6 }]}>
                  {item.mins}m
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070D',
  },

  /* HEADER */
  topHeader: {
    paddingTop: 28,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,240,255,0.15)',
    backgroundColor: '#070A14',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#E6F7FF',
  },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modeActive: {
    backgroundColor: 'rgba(0,240,255,0.14)',
    borderColor: 'rgba(0,240,255,0.35)',
  },
  modeText: {
    color: '#E6F7FF',
    fontWeight: '600',
  },

  quote: {
    marginHorizontal: 24,
    marginBottom: 14,
    color: '#7A8FB3',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  /* CORE */
  coreWrap: {
    marginHorizontal: 20,
    marginBottom: 26,
    paddingVertical: 30,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#04060C',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.35)',
    shadowColor: '#00F0FF',
    shadowRadius: 28,
    elevation: 10,
  },
  coreInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#020409',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
  },
  coreValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#00F0FF',
  },
  coreUnit: {
    color: '#7A8FB3',
    fontSize: 12,
    letterSpacing: 1,
  },
  coreSub: {
    color: '#E6F7FF',
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  coreTarget: {
    marginTop: 6,
    color: '#7A8FB3',
    fontWeight: '600',
  },

  emptyWrap: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#7A8FB3',
    fontSize: 15,
    textAlign: 'center',
  },

  /* LIST */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,240,255,0.05)',
  },
  day: { color: '#E6F7FF' },
  mins: { color: '#00F0FF', fontWeight: '800' },
});
