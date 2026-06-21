import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { showError } from '../utils/alert';
import { formatCoordinates, getCurrentPosition } from '../utils/location';

const ADDRESS_MAX_LENGTH = 500;

export default function LocationField({
  latitude,
  longitude,
  address = '',
  onChange,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const handleUseLocation = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);
    setGpsError(null);

    try {
      const position = await getCurrentPosition();
      onChange({
        latitude: position.latitude,
        longitude: position.longitude,
        address,
      });
    } catch (err) {
      const message = err.message || 'Konum alınamadı.';
      setGpsError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (text) => {
    onChange({
      latitude,
      longitude,
      address: text,
    });
  };

  const handleClearGps = () => {
    if (disabled) {
      return;
    }
    setGpsError(null);
    onChange({ latitude: null, longitude: null, address });
  };

  const handleClearAddress = () => {
    if (disabled) {
      return;
    }
    onChange({ latitude, longitude, address: '' });
  };

  const hasGps = latitude != null && longitude != null;
  const hasAddress = Boolean(address?.trim());
  const formatted = formatCoordinates(latitude, longitude);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.locationButton,
          disabled && styles.locationButtonDisabled,
          loading && styles.locationButtonLoading,
        ]}
        activeOpacity={0.8}
        onPress={handleUseLocation}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#2563EB" size="small" />
        ) : (
          <Text
            style={[
              styles.locationButtonText,
              disabled && styles.locationButtonTextDisabled,
            ]}
          >
            Konumumu Kullan (GPS)
          </Text>
        )}
      </TouchableOpacity>

      {hasGps && (
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>GPS koordinatları</Text>
          <Text style={styles.locationValue}>{formatted}</Text>
          {!disabled && (
            <TouchableOpacity onPress={handleClearGps} activeOpacity={0.7}>
              <Text style={styles.clearText}>GPS konumunu temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {gpsError && !hasGps && (
        <Text style={styles.errorText}>{gpsError}</Text>
      )}

      <Text style={styles.orText}>veya adres yazın (opsiyonel)</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={address}
        onChangeText={handleAddressChange}
        placeholder="Örn: Atatürk Mah. İş Merkezi No:12, İstanbul"
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={ADDRESS_MAX_LENGTH}
        textAlignVertical="top"
        editable={!disabled}
      />
      {hasAddress && !disabled && (
        <TouchableOpacity onPress={handleClearAddress} activeOpacity={0.7}>
          <Text style={styles.clearTextInline}>Adresi temizle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  locationButtonLoading: {
    opacity: 0.8,
  },
  locationButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  locationButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
  },
  locationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  locationCard: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    color: '#065F46',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clearText: {
    marginTop: 8,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  clearTextInline: {
    marginTop: 6,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
  },
  orText: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
});
