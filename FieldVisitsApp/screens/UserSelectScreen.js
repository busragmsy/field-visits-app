import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { login } from '../services/api';
import { useUser } from '../context/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEMO_ACCOUNTS = [
  { label: 'Saha Kullanıcısı', email: 'busra@test.com' },
  { label: 'Merkez Admin', email: 'admin@test.com' },
];

export default function UserSelectScreen() {
  const { loginUser } = useUser();
  const [email, setEmail] = useState('busra@test.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (nextEmail = email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(nextEmail.trim(), password);
      loginUser(response);
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı. Sunucu çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Saha Ziyaretleri</Text>
        <Text style={styles.subtitle}>Devam etmek için giriş yapın</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ornek@test.com"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Şifre"
          placeholderTextColor="#9CA3AF"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabled]}
          activeOpacity={0.8}
          onPress={() => handleLogin()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.demoTitle}>Demo hesaplar</Text>
        {DEMO_ACCOUNTS.map((account) => (
          <TouchableOpacity
            key={account.email}
            style={styles.demoButton}
            activeOpacity={0.8}
            onPress={() => {
              setEmail(account.email);
              handleLogin(account.email);
            }}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>
              {account.label} ({account.email})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 12,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.7,
  },
  demoTitle: {
    marginTop: 20,
    marginBottom: 8,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  demoButton: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
  },
  demoButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
