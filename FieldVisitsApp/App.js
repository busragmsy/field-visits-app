import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import EditVisitScreen from './screens/EditVisitScreen';
import NewVisitScreen from './screens/NewVisitScreen';
import VisitListScreen from './screens/VisitListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
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
