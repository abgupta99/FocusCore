import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
} from 'react-native';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function TodoItem({ item, onToggle, onRemove, onFocus }) {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onRemove(item.id);
  };

  return (
    <Animated.View
      style={[
        styles.item,
        item.completed && styles.itemCompleted,
        { transform: [{ scale }], opacity },
      ]}
    >
      {/* ✅ CHECK ONLY */}
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        style={[
          styles.check,
          item.completed && styles.checkCompleted,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
      >
        {item.completed && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>

      {/* 📝 Title (tap toggles complete, explicit Start button to focus) */}
      <TouchableOpacity
        style={styles.titleWrap}
        activeOpacity={0.7}
        onPress={!item.completed ? () => onToggle(item.id) : undefined}
        accessibilityLabel={`Toggle ${item.title}`}
        accessibilityState={{ disabled: !!item.completed }}
      >
        <Text
          style={[
            styles.title,
            item.completed && styles.completed,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </TouchableOpacity>

      {/* ▶️ START FOCUS */}
      <TouchableOpacity
        onPress={!item.completed ? () => onFocus(item) : undefined}
        style={[styles.startButton, item.completed && styles.startButtonDisabled]}
        accessibilityLabel={`Start focus for ${item.title}`}
        accessibilityState={{ disabled: !!item.completed }}
        disabled={!!item.completed}
      >
        <Text style={[styles.startText, item.completed && styles.startTextDisabled]}>Start</Text>
      </TouchableOpacity>

      {/* ❌ REMOVE */}
      <TouchableOpacity onPress={handleRemove} style={styles.remove}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 🌌 Card
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0F1F',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  itemCompleted: {
    borderColor: 'rgba(0,240,255,0.6)',
  },

  // 🧠 Checkbox
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#00F0FF',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCompleted: {
    backgroundColor: '#00F0FF',
  },
  checkMark: {
    color: '#020716',
    fontWeight: '900',
    fontSize: 14,
  },

  // 📝 Title (focus trigger)
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#E6F7FF',
    letterSpacing: 0.6,
  },
  completed: {
    color: '#6F86A3',
    textDecorationLine: 'line-through',
  },

  // ❌ Remove
  remove: {
    padding: 6,
    marginLeft: 8,
  },
  removeText: {
    fontSize: 18,
    color: '#FF5F7A',
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  startText: {
    color: '#020716',
    fontWeight: '800',
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(0,240,255,0.18)',
  },
  startTextDisabled: {
    color: 'rgba(2,7,22,0.45)',
  },
});
