import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@todo:items';

export default function useTodos() {
  const [todos, setTodos] = useState([]);

  // 📥 Load todos
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setTodos(JSON.parse(raw));
      } catch (e) {
        console.warn('load todos', e);
      }
    })();
  }, []);

  // 💾 Save todos
  useEffect(() => {
    AsyncStorage
      .setItem(KEY, JSON.stringify(todos))
      .catch(e => console.warn('save todos', e));
  }, [todos]);

  // ➕ Add todo (date-based)
  const add = useCallback(({ title, createdDate } = {}) => {
    if (!title) return;

    const d = createdDate || new Date().toISOString().slice(0, 10);

    setTodos(t => [
      {
        id: Date.now().toString(),
        title,
        completed: false,
        createdDate: d,
      },
      ...t,
    ]);
  }, []);

  // ✅ Toggle complete
  const toggle = useCallback(id => {
    setTodos(t =>
      t.map(x =>
        x.id === id ? { ...x, completed: !x.completed } : x
      )
    );
  }, []);

  // ❌ Remove
  const remove = useCallback(id => {
    setTodos(t => t.filter(x => x.id !== id));
  }, []);

  // ✏️ Edit (future-proof)
  const edit = useCallback((id, patch) => {
    setTodos(t =>
      t.map(x =>
        x.id === id ? { ...x, ...patch } : x
      )
    );
  }, []);

  // ⬆️ Move to top
  const moveToTop = useCallback((id) => {
    setTodos(t => {
      const idx = t.findIndex(x => x.id === id);
      if (idx <= 0) return t;
      const item = t[idx];
      const copy = t.slice();
      copy.splice(idx, 1);
      copy.unshift(item);
      return copy;
    });
  }, []);

  // ⬇️ Move to bottom
  const moveToBottom = useCallback((id) => {
    setTodos(t => {
      const idx = t.findIndex(x => x.id === id);
      if (idx === -1 || idx === t.length - 1) return t;
      const item = t[idx];
      const copy = t.slice();
      copy.splice(idx, 1);
      copy.push(item);
      return copy;
    });
  }, []);

  // ↕️ Move to specific index
  const moveToIndex = useCallback((id, toIndex) => {
    setTodos(t => {
      const idx = t.findIndex(x => x.id === id);
      if (idx === -1) return t;
      const copy = t.slice();
      const [item] = copy.splice(idx, 1);
      const insertAt = Math.max(0, Math.min(toIndex, copy.length));
      copy.splice(insertAt, 0, item);
      return copy;
    });
  }, []);

  return {
    todos,
    add,
    toggle,
    remove,
    edit,
    setTodos,
    // drag/reorder removed
  };
}
