import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  getDefaultTime,
  setDefaultTime,
  getDefaultSound,
  setDefaultSound,
  getDefaultTarget,
  setDefaultTarget,
} from '../hooks/useSettings';

const TIME_OPTIONS = [10, 15, 25, 45, 60, 90];

export default function SettingsScreen() {
  const [defaultTime, setDefaultTimeState] = useState(25);
  const [defaultSound, setDefaultSoundState] = useState('none');
  const [targetDefault, setTargetDefault] = useState('60');
  const [savingTarget, setSavingTarget] = useState(false);
  const [savedTarget, setSavedTarget] = useState(60);

  useEffect(() => {
    (async () => {
      const t = await getDefaultTime();
      const s = await getDefaultSound();
      const tgt = await getDefaultTarget();
      setDefaultTimeState(t || 25);
      setDefaultSoundState(s || 'none');
      const saved = Number.isFinite(Number(tgt)) ? Number(tgt) : 60;
      setSavedTarget(saved);
      setTargetDefault(String(saved));
    })();
  }, []);

  const saveTarget = async () => {
    if (savingTarget) return;
    setSavingTarget(true);
    try {
      const n = parseInt(targetDefault, 10) || 60;
      const clamped = Math.max(1, Math.min(1440, n));
      await setDefaultTarget(clamped);
      setTargetDefault(String(clamped));
      setSavedTarget(clamped);
      Alert.alert('Saved', `Daily target set to ${clamped} minutes`);
    } catch (e) {
      console.warn('save target error', e);
      Alert.alert('Error', 'Could not save target');
    } finally {
      setSavingTarget(false);
    }
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          'I am using FOCUS CORE 🧠🔥 to stay focused and productive.\nTry it here 👇\nhttps://your-app-link.com',
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      {/* ⏱ DEFAULT TIME */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Default Focus Time</Text>
        <Picker
          selectedValue={defaultTime}
          onValueChange={async (v) => {
            setDefaultTimeState(v);
            await setDefaultTime(v);
          }}
          style={styles.picker}
          dropdownIconColor="#00F0FF"
        >
          {TIME_OPTIONS.map(t => (
            <Picker.Item key={t} label={`${t} minutes`} value={t} />
          ))}
        </Picker>
      </View>

      {/* 🎧 DEFAULT SOUND */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Default Focus Sound</Text>
        <Picker
          selectedValue={defaultSound}
          onValueChange={async (v) => {
            setDefaultSoundState(v);
            await setDefaultSound(v);
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

      {/* 🎯 DAILY TARGET */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Target (minutes)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={targetDefault}
            onChangeText={(txt) => {
              // keep only digits while typing; allow empty to let user edit
              const cleaned = txt.replace(/[^0-9]/g, '');
              setTargetDefault(cleaned);
            }}
            onBlur={() => {
              // if user left it empty, restore a sensible default
              if (!targetDefault || targetDefault.length === 0) {
                setTargetDefault('60');
              }
            }}
            onSubmitEditing={async () => {
              // allow pressing the keyboard done to save
              await saveTarget();
            }}
            keyboardType="number-pad"
            returnKeyType="done"
            style={styles.targetInput}
            placeholder="60"
            placeholderTextColor="#89A"
            maxLength={4}
          />
          <TouchableOpacity
            style={
              [
                styles.saveButton,
                savingTarget ? { opacity: 0.6 } : null,
                // disabled look
                (!targetDefault || String(Number(targetDefault || 0)) === String(savedTarget)) ? styles.saveDisabled : null,
              ]
            }
            onPress={async () => {
              const canSave = Boolean(targetDefault && String(Number(targetDefault || 0)) !== String(savedTarget));
              if (!canSave) return;
              await saveTarget();
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.saveText}>{savingTarget ? '...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  header: {
    paddingTop: 44,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,240,255,0.15)',
    backgroundColor: '#070A14',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#E6F7FF',
  },

  /* CARDS */
  card: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#070B1A',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
  },
  cardTitle: {
    color: '#7A8FB3',
    fontSize: 13,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  picker: {
    color: '#E6F7FF',
    backgroundColor: '#070B1A',
  },

  /* SHARE */
  shareRow: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#04060C',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.35)',
  },
  shareText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00F0FF',
  },
  targetInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#050610',
    color: '#E6F7FF',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.08)',
  },
  saveButton: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#00F0FF',
  },
  saveText: {
    color: '#041017',
    fontWeight: '800',
  },
  saveDisabled: {
    backgroundColor: 'rgba(0,240,255,0.18)'
  },
});
