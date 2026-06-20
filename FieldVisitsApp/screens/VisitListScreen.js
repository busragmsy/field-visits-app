import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CalendarIcon from '../components/CalendarIcon';
import { approveOrRejectVisit, getVisitsByUser } from '../services/api';
import { formatIsoToTurkish } from '../utils/date';
import { getStatusConfig } from '../utils/status';

const USER_ID = 1;
const ADMIN_USER_ID = 2;

export default function VisitListScreen({ navigation }) {
  const [visits, setVisits] = useState([]);

  const loadVisits = useCallback(async () => {
    try {
      const data = await getVisitsByUser(USER_ID);
      setVisits(data);
    } catch {
      setVisits([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [loadVisits]),
  );

  const handleStatusChange = async (id, action) => {
    try {
      await approveOrRejectVisit(id, { adminUserId: ADMIN_USER_ID, action });
      await loadVisits();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Hata', error.message);
      }
    }
  };

  const showActionMenu = (item) => {
    Alert.alert('İşlem Seç', '', [
      { text: 'Onayla', onPress: () => handleStatusChange(item.id, 'Approve') },
      { text: 'Reddet', onPress: () => handleStatusChange(item.id, 'Reject') },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }) => {
    const status = getStatusConfig(item.status);
    const initial = item.customerName?.trim()?.charAt(0)?.toUpperCase() || '?';

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditVisit', { visit: item })}
          onLongPress={() => showActionMenu(item)}
        >
          <View style={[styles.avatar, { backgroundColor: status.circle }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.cardCenter}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customerName}
            </Text>
            <View style={styles.dateRow}>
              <CalendarIcon color="#9CA3AF" size={14} />
              <Text style={styles.dateText}>
                {formatIsoToTurkish(item.visitDate)}
              </Text>
            </View>
          </View>

          <View style={styles.cardRight}>
            <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
              <Text style={[styles.badgeText, { color: status.badgeText }]}>
                {status.label}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              activeOpacity={0.8}
              onPress={() => handleStatusChange(item.id, 'Approve')}
            >
              <Text style={styles.approveButtonText}>Onayla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              activeOpacity={0.8}
              onPress={() => handleStatusChange(item.id, 'Reject')}
            >
              <Text style={styles.rejectButtonText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>Ziyaretler</Text>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NewVisit')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={visits}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz ziyaret bulunmuyor.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '300',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCenter: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chevron: {
    marginLeft: 8,
    fontSize: 22,
    color: '#9CA3AF',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#D1FAE5',
    marginRight: 6,
  },
  approveButtonText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
    marginLeft: 6,
  },
  rejectButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 48,
    fontSize: 15,
  },
});
