import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusConfig } from '../utils/status';

const STATUS_OPTIONS = [
  { key: 'All', label: 'Tümü' },
  { key: 'Pending', label: 'Bekliyor' },
  { key: 'Approved', label: 'Onaylandı' },
  { key: 'Rejected', label: 'Reddedildi' },
];

const SORT_OPTIONS = [
  { key: 'dateDesc', label: 'Tarih (Yeni → Eski)' },
  { key: 'dateAsc', label: 'Tarih (Eski → Yeni)' },
  { key: 'nameAsc', label: 'Müşteri (A → Z)' },
  { key: 'nameDesc', label: 'Müşteri (Z → A)' },
];

function getStatusLabel(key) {
  if (key === 'All') {
    return 'Tümü';
  }
  return getStatusConfig(key).label;
}

function getSortLabel(key) {
  return SORT_OPTIONS.find((o) => o.key === key)?.label ?? '';
}

function OptionRow({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionRow, selected && styles.optionRowSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

function OptionPicker({
  label,
  summary,
  sheetTitle,
  options,
  selectedKey,
  onSelect,
  defaultKey,
}) {
  const [visible, setVisible] = useState(false);
  const showReset = selectedKey !== defaultKey;

  return (
    <View style={styles.pickerWrap}>
      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <View style={styles.triggerLeft}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerSummary} numberOfLines={1}>
            {summary}
          </Text>
        </View>
        <Text style={styles.triggerIcon}>▾</Text>
      </TouchableOpacity>

      {showReset && (
        <TouchableOpacity
          style={styles.resetChip}
          activeOpacity={0.8}
          onPress={() => onSelect(defaultKey)}
        >
          <Text style={styles.resetText}>✕</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{sheetTitle}</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <OptionRow
                  key={option.key}
                  label={option.label}
                  selected={selectedKey === option.key}
                  onPress={() => onSelect(option.key)}
                />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.doneButton}
              activeOpacity={0.8}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.doneButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function ListOptionsButton({
  statusFilter,
  sortKey,
  onStatusChange,
  onSortChange,
}) {
  return (
    <View style={styles.wrapper}>
      <OptionPicker
        label="Filtrele"
        summary={getStatusLabel(statusFilter)}
        sheetTitle="Duruma Göre Filtrele"
        options={STATUS_OPTIONS}
        selectedKey={statusFilter}
        onSelect={onStatusChange}
        defaultKey="All"
      />
      <OptionPicker
        label="Sırala"
        summary={getSortLabel(sortKey)}
        sheetTitle="Sıralama"
        options={SORT_OPTIONS}
        selectedKey={sortKey}
        onSelect={onSortChange}
        defaultKey="dateDesc"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  pickerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  triggerLeft: {
    flex: 1,
    marginRight: 6,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  triggerSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  triggerIcon: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  resetChip: {
    marginLeft: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  sheet: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  sheetBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  doneButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
