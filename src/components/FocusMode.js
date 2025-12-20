import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Animated,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import styles from './focusStyles';
import { getDefaultTime, getDefaultSound } from '../hooks/useSettings';

// ensure notifications are shown when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SIZE = 220;
const STROKE = 10;

/* 🎧 SOUND MAP */
const SOUNDS = {
  none: null,
  rain: require('../asset/sound/rain.mp3'),
  birds: require('../asset/sound/birds.mp3'),
  river: require('../asset/sound/river.mp3'),
  white: require('../asset/sound/white.mp3'),
  ambient: require('../asset/sound/ambient.mp3'),
  gong: require('../asset/sound/gong.mp3'),
};

/* ⏱ TIME OPTIONS (minutes) */
const TIME_OPTIONS = [10, 15, 25, 45, 60, 90];

export default function FocusMode({ task, onExit }) {
  const [minutes, setMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('25');
  // allow minutes to be number or the string 'custom'
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [soundKey, setSoundKey] = useState('none');
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  // replace refs with state/local holders
  const [timerId, setTimerId] = useState(null);
  const [soundObj, setSoundObj] = useState(null);
  const [previewObj, setPreviewObj] = useState(null);
  const [previewTimeout, setPreviewTimeout] = useState(null);
  const [progress] = useState(() => new Animated.Value(0));
  const [glow] = useState(() => new Animated.Value(0));

  /* 🌌 Glow animation */
  useEffect(() => {
    // load persisted defaults for time and sound
    (async () => {
      try {
        const t = await getDefaultTime();
        const s = await getDefaultSound();
        if (t) {
          setMinutes(t);
        }
        if (s) {
          setSoundKey(s);
        }
      } catch (e) {}
    })();
  }, []);

  /* 🎧 PLAY SOUND */
  const playSound = async () => {
    if (!SOUNDS[soundKey]) return;

    await stopSound();

    try {
      const { sound } = await Audio.Sound.createAsync(
        SOUNDS[soundKey],
        { isLooping: true, volume: muted ? 0 : volume }
      );
      setSoundObj(sound);
      await sound.playAsync();
    } catch (e) {
      console.warn('[FocusMode] playSound error', e);
    }
  };

  /* 🔔 SEND LOCAL NOTIFICATION ON SESSION END */
  const sendEndNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let final = status;
      console.log('Notification permission status:', status);
      if (final !== 'granted') {
        const { status: req } = await Notifications.requestPermissionsAsync();
        final = req;
      }
      if (final === 'granted') {
         console.log('in final');
        const title = task && task.title ? `Focus complete: ${task.title}` : 'Focus session complete';
        const body = 'Your focus session has finished.';
        await Notifications.scheduleNotificationAsync({
          content: { title, body, data: { source: 'focus' } },
          trigger: null,
        });
      }
    } catch (e) {
      console.warn('[FocusMode] sendEndNotification error', e);
    }
  };

  /* 🛑 STOP SOUND */
  const stopSound = async () => {
    if (soundObj) {
      try {
        if (typeof soundObj.stopAsync === 'function') await soundObj.stopAsync();
        if (typeof soundObj.unloadAsync === 'function') await soundObj.unloadAsync();
      } catch {}
      setSoundObj(null);
    }
  };

  /* 🔉 STOP PREVIEW */
  const stopPreview = async () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }
    if (previewObj) {
      try {
        if (typeof previewObj.stopAsync === 'function') await previewObj.stopAsync();
        if (typeof previewObj.unloadAsync === 'function') await previewObj.unloadAsync();
      } catch {}
      setPreviewObj(null);
    }
  };

  /* 🔉 PREVIEW SOUND (5s) */
  const previewSound = async (key) => {
    // interrupt any existing preview
    await stopPreview();
    if (!SOUNDS[key]) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        SOUNDS[key],
        { isLooping: false, volume: muted ? 0 : Math.min(1, volume + 0.1) }
      );
      setPreviewObj(sound);
      await sound.playAsync();
      const t = setTimeout(async () => {
        try {
          if (sound) {
            if (typeof sound.stopAsync === 'function') await sound.stopAsync();
            if (typeof sound.unloadAsync === 'function') await sound.unloadAsync();
          }
        } catch {}
        setPreviewObj(prev => (prev === sound ? null : prev));
        setPreviewTimeout(null);
      }, 5000);
      setPreviewTimeout(t);
    } catch (e) {
      console.warn('[FocusMode] previewSound error', e);
    }
  };

  /* 🔊 APPLY VOLUME TO PLAYING SOUNDS */
  const setAllVolumes = async (vol) => {
    try {
      if (soundObj && typeof soundObj.setVolumeAsync === 'function') {
        await soundObj.setVolumeAsync(vol);
      }
      if (previewObj && typeof previewObj.setVolumeAsync === 'function') {
        await previewObj.setVolumeAsync(vol);
      }
    } catch (e) {
      // ignore
    }
  };

  // apply volume/mute changes immediately to any playing sounds
  useEffect(() => {
    const v = muted ? 0 : volume;
    setAllVolumes(v);
  }, [volume, muted]);

  // playback is started explicitly through startFocus / togglePause resume

  /* ⏱ TIMER */
  useEffect(() => {
    if (!started || paused || ended) return;
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(id);
          setTimerId(null);
          setEnded(true);
          stopSound();
          // send a local notification when the session naturally ends
          sendEndNotification().catch(() => {});
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    setTimerId(id);

    return () => {
      clearInterval(id);
      setTimerId(null);
    };
  }, [started, paused]);

  /* 🔄 Progress */
  useEffect(() => {
    if (!started || paused || ended) return;

    Animated.timing(progress, {
      toValue: (totalSeconds - seconds) / totalSeconds,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [seconds]);

  const rotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  /* ▶️ START */
  const startFocus = async () => {
  const minuteValue = (minutes === 'custom') ? customMinutes : minutes;
  const clampedMinutes = Math.max(1, Math.min(480, Number(minuteValue || 25)));
    const v = clampedMinutes * 60;
    // stop any preview playing
    await stopPreview();
    setTotalSeconds(v);
    setSeconds(v);
    setStarted(true);
    setPaused(false);
    setEnded(false);
    progress.setValue(0);
    // explicitly start playback when focus begins
    try {
      await playSound();
      await setAllVolumes(muted ? 0 : volume);
    } catch (e) {
      // ignore playback errors here
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* ⏸ PAUSE */
const togglePause = async () => {
  const goingToPause = !paused;
  setPaused(goingToPause);

  if (goingToPause) {
    // stop timer and all audio (main + preview)
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    await stopSound();
    await stopPreview();
  } else {
    // resume: restart sound and apply volume
    try {
      await playSound();
      await setAllVolumes(muted ? 0 : volume);
    } catch (e) {
      // ignore
    }
  }

  Haptics.selectionAsync();
};


  // no paused ref anymore; state wins

  /* ❌ EXIT */
  const exitFocus = async (done) => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    await stopSound();
    await stopPreview();
    // compute elapsed minutes (rounded). If nothing ran, this will be 0.
    const elapsedMinutes = Math.max(0, Math.round((totalSeconds - seconds) / 60));
    onExit(done, elapsedMinutes);
  };

  /* ⏪ HANDLE ANDROID BACK BUTTON */
  useEffect(() => {
    const onBack = () => {
      // when focus mode is active, go back to home (exit focus)
      exitFocus(false);
      return true; // prevent default (do not exit app)
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  return (
    <View style={styles.overlay}>
      <Text style={styles.mode}>FOCUS MODE</Text>
      <Text style={styles.task}>{task.title}</Text>

      {/* ⏱ TIME DROPDOWN */}
      {!started && (
        <View style={styles.dropdownWrap}>
          <Text style={styles.label}>Focus Time</Text>
          <Picker
            selectedValue={minutes}
            onValueChange={(v) => setMinutes(v)}
            style={styles.picker}
            dropdownIconColor="#00F0FF"
          >
            {TIME_OPTIONS.map(m => (
              <Picker.Item key={m} label={`${m} minutes`} value={m} />
            ))}
            <Picker.Item key="custom" label="Custom..." value="custom" />
          </Picker>
          {/* custom time input */}
          {minutes === 'custom' && (
            <View style={styles.customTimeRow}>
              <TextInput
                style={styles.customInput}
                keyboardType="number-pad"
                value={customMinutes}
                onChangeText={(t) => {
                  // allow the user to edit freely; keep only digits but allow empty
                  const cleaned = t.replace(/[^0-9]/g, '');
                  setCustomMinutes(cleaned);
                }}
                onBlur={() => {
                  // when the user leaves the input, clamp to 1-480 and ensure a value
                  const n = parseInt(customMinutes || '0', 10) || 0;
                  const clamped = Math.max(1, Math.min(480, n || 25));
                  setCustomMinutes(String(clamped));
                }}
                placeholder="Minutes"
              />
              <Text style={styles.customTimeLabel}>min</Text>
            </View>
          )}
        </View>
      )}

      {/* 🎧 SOUND DROPDOWN */}
      {!started && (
        <View style={styles.dropdownWrap}>
          <Text style={styles.label}>Focus Sound</Text>
          <Picker
            selectedValue={soundKey}
            onValueChange={(v) => {
              setSoundKey(v);
              if (!started) previewSound(v);
            }}
            style={styles.picker}
            dropdownIconColor="#00F0FF"
          >
            <Picker.Item label="None" value="none" />
            <Picker.Item label="Rain" value="rain" />
            <Picker.Item label="Birds" value="birds" />
            <Picker.Item label="River" value="river" />
            <Picker.Item label="White Noise" value="white" />
            <Picker.Item label="Ambient" value="ambient" />
            <Picker.Item label="Gong" value="gong" />
          </Picker>
        </View>
      )}

      {/* 🕒 TIMER */}
      {started && !ended && (
        <Animated.View style={[styles.clockWrap, { transform: [{ scale: glowScale }] }]}>
          <View style={styles.ring} />
          <Animated.View style={[styles.progress, { transform: [{ rotate: rotation }] }]} />
          <View style={styles.center}>
            <Text style={styles.time}>
              {min}:{sec.toString().padStart(2, '0')}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ▶️ START */}
      {!started && (
        <TouchableOpacity style={styles.startBtn} onPress={startFocus}>
          <Text style={styles.startText}>START FOCUS</Text>
        </TouchableOpacity>
      )}

      {/* ⏸ PAUSE */}
      {started && !ended && (
        <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
          <Text style={styles.pauseText}>{paused ? 'RESUME' : 'PAUSE'}</Text>
        </TouchableOpacity>
      )}

      {/* 🔊 VOLUME / MUTE CONTROLS (during focus) - hidden when no sound selected */}
      {started && !ended && soundKey !== 'none' && (
        <View style={styles.volumeRow}>
          <TouchableOpacity onPress={async () => { const newMuted = !muted; setMuted(newMuted); await setAllVolumes(newMuted ? 0 : volume); }} style={styles.muteBtn}>
            <Text style={styles.muteText}>{muted ? 'UNMUTE' : 'MUTE'}</Text>
          </TouchableOpacity>
          <View style={styles.volControls}>
            <TouchableOpacity onPress={async () => { const v = Math.max(0, +(Math.round((volume - 0.1) * 10) / 10).toFixed(1)); setVolume(v); await setAllVolumes(muted ? 0 : v); }} style={styles.volBtn}><Text style={styles.volText}>-</Text></TouchableOpacity>
            <Text style={styles.volLabel}>{Math.round(volume * 100)}%</Text>
            <TouchableOpacity onPress={async () => { const v = Math.min(1, +(Math.round((volume + 0.1) * 10) / 10).toFixed(1)); setVolume(v); await setAllVolumes(muted ? 0 : v); }} style={styles.volBtn}><Text style={styles.volText}>+</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* 🏁 END */}
      {ended && (
        <>
          <TouchableOpacity style={styles.endBtn} onPress={() => exitFocus(true)}>
            <Text style={styles.endText}>✔ FINISH TASK</Text>
          </TouchableOpacity>

          {/* After session ends allow prolonging the session by 10 minutes */}
          <View style={styles.postSoundWrap}>
            <TouchableOpacity
              style={styles.prolongBtn}
              onPress={async () => {
                const add = 10 * 60; // 10 minutes in seconds
                setTotalSeconds((prev) => prev + add);
                setSeconds((prev) => prev + add);
                setEnded(false);
                setStarted(true);
                setPaused(false);
                // start playback for the prolonged period
                try {
                  await playSound();
                  await setAllVolumes(muted ? 0 : volume);
                } catch (e) {
                  // ignore
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text style={styles.prolongText}>Prolong +10 min</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ❌ EXIT */}
      <TouchableOpacity style={styles.exit} onPress={() => exitFocus(false)}>
        <Text style={styles.exitText}>EXIT</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles moved to ./focusStyles
