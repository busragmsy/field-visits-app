import { Platform } from 'react-native';

const QUEUE_KEY = 'fieldVisitsOfflineQueue';
let memoryQueue = [];

function readQueue() {
  if (Platform.OS !== 'web') {
    return memoryQueue;
  }

  const raw = window.localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeQueue(items) {
  if (Platform.OS !== 'web') {
    memoryQueue = items;
    return;
  }

  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function enqueueVisit(payload) {
  const items = readQueue();
  writeQueue([
    ...items,
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      payload,
      createdAt: new Date().toISOString(),
    },
  ]);
}

export function getQueuedVisits() {
  return readQueue();
}

export function removeQueuedVisit(id) {
  writeQueue(readQueue().filter((item) => item.id !== id));
}
