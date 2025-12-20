import React, { useRef } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onRemove, onFocus }) {
  if (!todos.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.hudIcon}>⬢</Text>
        <Text style={styles.emptyTitle}>FOCUS SYSTEM READY</Text>
        <Text style={styles.emptySub}>
          Create a task to initialize workflow
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <TodoItem
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
          onFocus={onFocus}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    paddingBottom: 160,
    backgroundColor: '#05070D',
  },

  card: {
    marginBottom: 18,
    borderRadius: 24,
    padding: 10,
    backgroundColor: '#2246bbff',
    borderWidth: 1,
    borderColor: 'rgba(228, 109, 34, 0.25)',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  empty: {
    flex: 1,
    backgroundColor: '#05070D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  hudIcon: {
    fontSize: 48,
    color: '#00F0FF',
    opacity: 0.8,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#E6F7FF',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#7A8FB3',
    textAlign: 'center',
    lineHeight: 22,
  },
});
