import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CalendarIcon from '../components/CalendarIcon';
import ListOptionsButton from '../components/ListOptionsButton';
import { useUser } from '../context/UserContext';
import {
  approveOrRejectVisit,
  createVisit,
  getAllVisits,
  getVisitsByUser,
} from '../services/api';
import { showError } from '../utils/alert';
import { formatIsoToTurkish } from '../utils/date';
import { getStatusConfig } from '../utils/status';
import { sortVisits } from '../utils/sortVisits';
import { getQueuedVisits, removeQueuedVisit } from '../utils/offlineQueue';

export default function VisitListScreen({ navigation }) {
  const { currentUser, logoutUser } = useUser();
  const isAdmin = currentUser.role === 'Admin';
  const [visits, setVisits] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [queuedCount, setQueuedCount] = useState(getQueuedVisits().length);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('dateDesc');

  const loadVisits = useCallback(async (page = 1) => {
    try {
      const params = {
        page,
        pageSize: 20,
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search.trim() || undefined,
        sort: sortKey,
      };
      const data = isAdmin
        ? await getAllVisits(params)
        : await getVisitsByUser(currentUser.id, params);

      setVisits((current) =>
        page === 1 ? data.items : [...current, ...data.items],
      );
      setPageInfo({ page: data.page, totalPages: data.totalPages });
    } catch {
      setVisits([]);
    }
  }, [isAdmin, currentUser.id, search, sortKey, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      loadVisits(1);
    }, [loadVisits]),
  );

  const filteredVisits = useMemo(() => {
    return sortVisits(visits, sortKey);
  }, [visits, sortKey]);

  const handleStatusChange = async (id, action, rejectReason = null) => {
    try {
      await approveOrRejectVisit(id, { action, rejectReason });
      await loadVisits(1);
    } catch (error) {
      showError(error.message);
    }
  };

  const rejectVisit = (item) => {
    if (Platform.OS === 'web') {
      const reason = window.prompt('Red nedeni');
      if (reason?.trim()) {
        handleStatusChange(item.id, 'Reject', reason.trim());
      }
      return;
    }

    Alert.prompt?.(
      'Red nedeni',
      'Ziyaretin neden reddedildiğini yazın.',
      (reason) => {
        if (reason?.trim()) {
          handleStatusChange(item.id, 'Reject', reason.trim());
        }
      },
    ) ?? handleStatusChange(item.id, 'Reject', 'Mobil hızlı red');
  };

  const showActionMenu = (item) => {
    if (item.status !== 'Pending') {
      return;
    }

    if (Platform.OS === 'web') {
      return;
    }

    Alert.alert('İşlem Seç', '', [
      { text: 'Onayla', onPress: () => handleStatusChange(item.id, 'Approve') },
      { text: 'Reddet', onPress: () => rejectVisit(item) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const loadMore = async () => {
    if (loadingMore || pageInfo.page >= pageInfo.totalPages) {
      return;
    }

    setLoadingMore(true);
    await loadVisits(pageInfo.page + 1);
    setLoadingMore(false);
  };

  const syncOfflineQueue = async () => {
    try {
      const queuedVisits = getQueuedVisits();
      for (const item of queuedVisits) {
        await createVisit(item.payload);
        removeQueuedVisit(item.id);
      }

      setQueuedCount(getQueuedVisits().length);
      await loadVisits(1);
    } catch (error) {
      showError(error.message);
      setQueuedCount(getQueuedVisits().length);
    }
  };

  const renderItem = ({ item }) => {
    const status = getStatusConfig(item.status);
    const initial = item.customerName?.trim()?.charAt(0)?.toUpperCase() || '?';
    const canModerate = isAdmin && item.status === 'Pending';

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditVisit', { visit: item })}
          onLongPress={canModerate ? () => showActionMenu(item) : undefined}
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

        {canModerate && (
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
              onPress={() => rejectVisit(item)}
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isAdmin ? 'Tüm Ziyaretler' : 'Ziyaretlerim'}
          </Text>
          <Text style={styles.headerUser} numberOfLines={1}>
            {currentUser.name} · {isAdmin ? 'Merkez' : 'Saha'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.customersButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Customers')}
            >
              <Text style={styles.customersButtonText}>Müşteriler</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.switchButton}
            activeOpacity={0.8}
            onPress={logoutUser}
          >
            <Text style={styles.switchButtonText}>Çıkış</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NewVisit')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ListOptionsButton
        statusFilter={statusFilter}
        sortKey={sortKey}
        onStatusChange={setStatusFilter}
        onSortChange={setSortKey}
      />

      {queuedCount > 0 && (
        <TouchableOpacity
          style={styles.offlineBanner}
          activeOpacity={0.8}
          onPress={syncOfflineQueue}
        >
          <Text style={styles.offlineBannerText}>
            {queuedCount} offline kayıt bekliyor. Senkronize et.
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Müşteri, adres veya not ara"
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={() => loadVisits(1)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.8}
          onPress={() => loadVisits(1)}
        >
          <Text style={styles.searchButtonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {statusFilter === 'All'
              ? 'Henüz ziyaret bulunmuyor.'
              : 'Bu filtreye uygun ziyaret bulunamadı.'}
          </Text>
        }
        ListFooterComponent={
          pageInfo.page < pageInfo.totalPages ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              activeOpacity={0.8}
              onPress={loadMore}
              disabled={loadingMore}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </Text>
            </TouchableOpacity>
          ) : null
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerUser: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    marginRight: 8,
  },
  customersButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    marginRight: 8,
  },
  customersButtonText: {
    color: '#6D28D9',
    fontWeight: '600',
    fontSize: 13,
  },
  switchButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
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
    paddingTop: 8,
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  offlineBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  offlineBannerText: {
    color: '#92400E',
    fontWeight: '600',
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  loadMoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
