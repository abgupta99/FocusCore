import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard
} from 'react-native';

export default function TodoInput({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAdd({ title: value.trim() });
    setValue('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="INITIATE TASK"
        placeholderTextColor="#5C6B8A"
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <TouchableOpacity
        onPress={submit}
        style={styles.addButton}
        activeOpacity={0.85}
        accessibilityLabel="Add task"
      >
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // 🧠 Glass console
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0F1F',
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',

    shadowColor: '#00F0FF',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  // ⌨️ Input field
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#E6F7FF',
    letterSpacing: 0.8,
  },

  // ⚡ Neon action button
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#00F0FF',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  addText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#020716',
    marginTop: -2,
  },
});
