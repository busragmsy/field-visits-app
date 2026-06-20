import { View } from 'react-native';

export default function CalendarIcon({ color = '#6B7280', size = 16 }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.15,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 3,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.22,
          width: 2,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: size * 0.22,
          width: 2,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          left: size * 0.08,
          right: size * 0.08,
          height: 1.5,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
