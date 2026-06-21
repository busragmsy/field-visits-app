import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeApiUrl(url) {
  const trimmed = url.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function getExpoDevHost() {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri?.split('/')[0];

  if (!debuggerHost) {
    return null;
  }

  return debuggerHost.split(':')[0];
}

/**
 * Web: localhost. Expo Go: Metro'nun bağlı olduğu makine IP'si.
 * İsterseniz .env içinde EXPO_PUBLIC_API_URL ile geçersiz kılın.
 */
export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  const devHost = getExpoDevHost();
  if (devHost) {
    return `http://${devHost}:5000/api`;
  }

  return 'http://localhost:5000/api';
}
