import { useLayoutEffect, useState } from 'react';
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
import ConfirmDialog from '../components/ConfirmDialog';
import DatePickerField from '../components/DatePickerField';
import LocationField from '../components/LocationField';
import SuccessOverlay from '../components/SuccessOverlay';
import { useUser } from '../context/UserContext';
import { deleteVisit, updateVisit } from '../services/api';
import { showError } from '../utils/alert';
import { formatDateTimeToTurkish } from '../utils/date';
import { formatCoordinates } from '../utils/location';
import { getStatusConfig } from '../utils/status';

const NOTE_MAX_LENGTH = 500;
const SUCCESS_DELAY_MS = 1400;

export default function EditVisitScreen({ route, navigation }) {
  const { visit } = route.params;
  const { currentUser } = useUser();
  const isAdmin = currentUser.role === 'Admin';
  const status = getStatusConfig(visit.status);
  const isLocked =
    visit.status === 'Approved' || (visit.status === 'Rejected' && !isAdmin);

  const statusBannerMessage =
    visit.status === 'Rejected' && isAdmin
      ? 'Bu ziyaret reddedildi. Merkez olarak düzenleyebilirsiniz; kayıt tekrar onaya gönderilir.'
      : status.bannerMessage;

  const [customerName, setCustomerName] = useState(visit.customerName);
  const [visitDate, setVisitDate] = useState(visit.visitDate);
  const [note, setNote] = useState(visit.note ?? '');
  const [latitude, setLatitude] = useState(visit.latitude ?? null);
  const [longitude, setLongitude] = useState(visit.longitude ?? null);
  const [address, setAddress] = useState(visit.address ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameError = submitted && !customerName.trim();
  const dateError = submitted && !visitDate;

  const handleLocationChange = ({ latitude: lat, longitude: lng, address: addr }) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr ?? '');
  };

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    setDeleting(true);
    try {
      await deleteVisit(visit.id);
      setDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error) {
      showError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  useLayoutEffect(() => {
    if (isLocked) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setDeleteDialogVisible(true)}
          style={styles.headerDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.headerDeleteText}>Sil</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLocked]);

  const handleUpdate = async () => {
    if (isLocked) {
      return;
    }

    setSubmitted(true);

    if (!customerName.trim() || !visitDate) {
      return;
    }

    setSaving(true);
    try {
      await updateVisit(visit.id, {
        customerName: customerName.trim(),
        visitDate,
        note: note || null,
        latitude,
        longitude,
        address: address.trim() || null,
        requestedByUserId: currentUser.id,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, SUCCESS_DELAY_MS);
    } catch (error) {
      showError(error.message);
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
        <View style={[styles.statusBanner, { backgroundColor: status.bannerBg }]}>
          <Text style={[styles.statusBannerText, { color: status.bannerText }]}>
            {statusBannerMessage}
          </Text>
          <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
            <Text style={[styles.badgeText, { color: status.badgeText }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>
          Müşteri Adı <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            isLocked && styles.inputDisabled,
            nameError && styles.inputError,
          ]}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Müşteri adını giriniz"
          placeholderTextColor="#9CA3AF"
          editable={!isLocked}
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
          disabled={isLocked}
          restrictPastDates={false}
          errorText={dateError ? 'Ziyaret tarihi zorunludur.' : null}
        />

        <Text style={styles.label}>Konum</Text>
        <LocationField
          latitude={latitude}
          longitude={longitude}
          address={address}
          disabled={isLocked}
          onChange={handleLocationChange}
        />

        <Text style={styles.label}>Not</Text>
        <View>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              isLocked && styles.inputDisabled,
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Ziyaret notunu giriniz (opsiyonel)"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={NOTE_MAX_LENGTH}
            textAlignVertical="top"
            editable={!isLocked}
          />
          <Text style={styles.counter}>
            {note.length} / {NOTE_MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Ziyaret Bilgileri</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Oluşturulma Tarihi</Text>
            <Text style={styles.infoValue}>
              {formatDateTimeToTurkish(visit.createdDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Onay Durumu</Text>
            <Text style={styles.infoValue}>{status.approvalLabel}</Text>
          </View>
          {formatCoordinates(latitude, longitude) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GPS</Text>
              <Text style={styles.infoValue}>
                {formatCoordinates(latitude, longitude)}
              </Text>
            </View>
          )}
          {address?.trim() ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adres</Text>
              <Text style={[styles.infoValue, styles.infoValueMultiline]}>
                {address.trim()}
              </Text>
            </View>
          ) : null}
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
            style={[
              styles.saveButton,
              (isLocked || saving) && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleUpdate}
            disabled={isLocked || saving}
          >
            <Text
              style={[
                styles.saveButtonText,
                (isLocked || saving) && styles.saveButtonTextDisabled,
              ]}
            >
              Güncelle
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessOverlay
        visible={showSuccess}
        message="Ziyaret başarıyla güncellendi"
      />

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Ziyareti silmek istediğinize emin misiniz?"
        message={`"${visit.customerName}" kaydı kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
        confirmLabel={deleting ? 'Siliniyor...' : 'Evet, Sil'}
        cancelLabel="Vazgeç"
        destructive
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteDialogVisible(false)}
      />
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
  headerDelete: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerDeleteText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
  },
  statusBannerText: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
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
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
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
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  infoValueMultiline: {
    textAlign: 'right',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
