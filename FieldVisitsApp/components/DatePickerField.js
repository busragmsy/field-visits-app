import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalendarIcon from './CalendarIcon';
import {
  formatDateToYYYYMMDD,
  formatIsoToTurkish,
  getTodayStart,
  parseIsoDate,
} from '../utils/date';

export default function DatePickerField({
  value,
  onChange,
  disabled = false,
  errorText,
  restrictPastDates = true,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [pastDateWarning, setPastDateWarning] = useState(false);

  const todayIso = formatDateToYYYYMMDD(getTodayStart());

  const handleNativeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    const picked = new Date(selectedDate);
    picked.setHours(0, 0, 0, 0);

    if (picked < getTodayStart()) {
      setPastDateWarning(true);
      return;
    }

    setPastDateWarning(false);
    onChange(formatDateToYYYYMMDD(picked));
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        <input
          type="date"
          value={value || ''}
          min={restrictPastDates ? todayIso : undefined}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: errorText ? '#EF4444' : '#ddd',
            borderRadius: 8,
            backgroundColor: disabled ? '#F9FAFB' : '#fff',
            height: 48,
            boxSizing: 'border-box',
            color: disabled ? '#9CA3AF' : '#111827',
          }}
        />
        {value ? (
          <Text style={styles.selected}>{formatIsoToTurkish(value)}</Text>
        ) : null}
        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dateInput,
          disabled && styles.disabled,
          errorText && styles.errorBorder,
        ]}
        activeOpacity={disabled ? 1 : 0.7}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <CalendarIcon color={disabled ? '#9CA3AF' : '#6B7280'} size={18} />
        <Text
          style={[
            styles.dateText,
            (!value || disabled) && styles.placeholder,
          ]}
        >
          {value ? formatIsoToTurkish(value) : 'Tarih seçiniz'}
        </Text>
      </TouchableOpacity>
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
      {pastDateWarning ? (
        <Text style={styles.error}>Bugünden önceki bir tarih seçemezsiniz.</Text>
      ) : null}
      {showPicker && !disabled && (
        <DateTimePicker
          value={parseIsoDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={restrictPastDates ? getTodayStart() : undefined}
          onChange={handleNativeChange}
        />
      )}
      {showPicker && Platform.OS === 'ios' && !disabled && (
        <TouchableOpacity
          style={styles.done}
          onPress={() => setShowPicker(false)}
        >
          <Text style={styles.doneText}>Tamam</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  disabled: {
    backgroundColor: '#F9FAFB',
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  selected: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
  },
  error: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
  },
  done: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
