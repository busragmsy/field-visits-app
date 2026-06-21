import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePickerField from '../components/DatePickerField';
import LocationField from '../components/LocationField';
import { createVisit } from '../services/api';
import { showError } from '../utils/alert';
import { enqueueVisit } from '../utils/offlineQueue';

const NOTE_MAX_LENGTH = 500;

export default function NewVisitScreen({ navigation }) {
  const [customerName, setCustomerName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [note, setNote] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [checkInNow, setCheckInNow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = submitted && !customerName.trim();
  const dateError = submitted && !visitDate;

  const handleSave = async () => {
    setSubmitted(true);

    if (!customerName.trim() || !visitDate) {
      return;
    }

    setSaving(true);
    const payload = {
      customerName: customerName.trim(),
      visitDate,
      note: note || null,
      latitude,
      longitude,
      address: address.trim() || null,
      checkInNow,
    };

    try {
      await createVisit(payload);
      navigation.goBack();
    } catch (error) {
      enqueueVisit(payload);
      showError(
        `${error.message}\n\nKayıt offline kuyruğa alındı. Liste ekranından tekrar gönderebilirsiniz.`,
      );
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Geçmiş tarihli ziyaret oluşturamazsınız.
          </Text>
        </View>

        <Text style={styles.label}>
          Müşteri Adı <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Müşteri adını giriniz"
          placeholderTextColor="#9CA3AF"
        />
        {nameError && (
          <Text style={styles.errorText}>Bu alan boş bırakılamaz.</Text>
        )}

        <Text style={styles.label}>
          Ziyaret Tarihi <Text style={styles.required}>*</Text>
        </Text>
        <DatePickerField
          value={visitDate}
          onChange={setVisitDate}
          errorText={dateError ? 'Ziyaret tarihi zorunludur.' : null}
        />

        <Text style={styles.label}>Konum</Text>
        <LocationField
          latitude={latitude}
          longitude={longitude}
          address={address}
          onChange={({ latitude: lat, longitude: lng, address: addr }) => {
            setLatitude(lat);
            setLongitude(lng);
            setAddress(addr ?? '');
          }}
        />

        <TouchableOpacity
          style={[styles.checkButton, checkInNow && styles.checkButtonActive]}
          activeOpacity={0.8}
          onPress={() => setCheckInNow((value) => !value)}
        >
          <Text
            style={[
              styles.checkButtonText,
              checkInNow && styles.checkButtonTextActive,
            ]}
          >
            {checkInNow ? 'Check-in yapılacak' : 'Kaydederken check-in yap'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Not</Text>
        <View>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={note}
            onChangeText={setNote}
            placeholder="Ziyaret notunu giriniz (opsiyonel)"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={NOTE_MAX_LENGTH}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {note.length} / {NOTE_MAX_LENGTH}
          </Text>
        </View>
        <View style={styles.noteBanner}>
          <Text style={styles.noteBannerText}>
            Not alanı en fazla 500 karakter olabilir.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>✕ İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabled]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoBannerText: {
    color: '#1D4ED8',
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
  },
  multiline: {
    minHeight: 100,
    paddingBottom: 28,
  },
  counter: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  noteBannerText: {
    color: '#D97706',
    fontSize: 13,
  },
  checkButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  checkButtonActive: {
    backgroundColor: '#DBEAFE',
  },
  checkButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  checkButtonTextActive: {
    color: '#1D4ED8',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
