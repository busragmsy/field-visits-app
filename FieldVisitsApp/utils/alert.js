import { Alert, Platform } from 'react-native';

export function showError(message, title = 'Hata') {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
