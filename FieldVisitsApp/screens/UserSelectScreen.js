import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUsers } from '../services/api';
import { useUser } from '../context/UserContext';

export default function UserSelectScreen() {
  const { setCurrentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Kullanıcılar yüklenemedi. Sunucu çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const renderItem = ({ item }) => {
    const isAdmin = item.role === 'Admin';
    const initial = item.name?.trim()?.charAt(0)?.toUpperCase() || '?';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => setCurrentUser(item)}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: isAdmin ? '#7C3AED' : '#2563EB' },
          ]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.cardCenter}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View
          style={[
            styles.roleBadge,
            { backgroundColor: isAdmin ? '#EDE9FE' : '#DBEAFE' },
          ]}
        >
          <Text
            style={[
              styles.roleText,
              { color: isAdmin ? '#6D28D9' : '#1D4ED8' },
            ]}
          >
            {isAdmin ? 'Merkez' : 'Saha'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Saha Ziyaretleri</Text>
        <Text style={styles.subtitle}>Devam etmek için bir kullanıcı seçin</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={loadUsers}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Kullanıcı bulunamadı.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 48,
    fontSize: 15,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
