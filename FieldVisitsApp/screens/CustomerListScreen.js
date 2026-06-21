import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getCustomers } from '../services/api';
import { showError } from '../utils/alert';

export default function CustomerListScreen() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getCustomers(search.trim() || undefined);
      setCustomers(data);
    } catch (error) {
      showError(error.message);
      setCustomers([]);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers]),
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      {item.address ? <Text style={styles.meta}>{item.address}</Text> : null}
      <Text style={styles.visitCount}>{item.visitCount} ziyaret</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Müşteri ara"
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={loadCustomers}
        />
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.8}
          onPress={loadCustomers}
        >
          <Text style={styles.searchButtonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Müşteri bulunamadı.</Text>
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
  searchRow: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  meta: {
    color: '#6B7280',
    marginTop: 4,
  },
  visitCount: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 48,
  },
});
