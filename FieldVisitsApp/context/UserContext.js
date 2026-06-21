import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { setAuthToken } from '../services/api';

const UserContext = createContext(null);
const SESSION_KEY = 'fieldVisitsSession';

function readStoredSession() {
  if (Platform.OS !== 'web') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function writeStoredSession(session) {
  if (Platform.OS !== 'web') {
    return;
  }

  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const session = readStoredSession();
    if (session?.token && session?.user) {
      setToken(session.token);
      setAuthToken(session.token);
      setCurrentUser(session.user);
    }
  }, []);

  const loginUser = ({ user, token: nextToken }) => {
    setCurrentUser(user);
    setToken(nextToken);
    setAuthToken(nextToken);
    writeStoredSession({ user, token: nextToken });
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setToken(null);
    setAuthToken(null);
    writeStoredSession(null);
  };

  return (
    <UserContext.Provider
      value={{ currentUser, token, loginUser, logoutUser, setCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
