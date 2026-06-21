import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { UserProvider, useUser } from './context/UserContext';
import EditVisitScreen from './screens/EditVisitScreen';
import NewVisitScreen from './screens/NewVisitScreen';
import UserSelectScreen from './screens/UserSelectScreen';
import VisitListScreen from './screens/VisitListScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <UserSelectScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#f5f5f5' },
          headerTintColor: '#2563eb',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="VisitList"
          component={VisitListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewVisit"
          component={NewVisitScreen}
          options={{ title: 'Yeni Ziyaret' }}
        />
        <Stack.Screen
          name="EditVisit"
          component={EditVisitScreen}
          options={{ title: 'Ziyaret Düzenle' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </UserProvider>
  );
}
