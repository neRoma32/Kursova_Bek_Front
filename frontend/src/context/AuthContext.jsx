import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const USERS_KEY = 'textAnalyzer_users';
const CURRENT_USER_KEY = 'textAnalyzer_currentUser';

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (e) {
      console.error('Failed to parse users', e);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const persistentUser = localStorage.getItem(CURRENT_USER_KEY);
      if (persistentUser) return JSON.parse(persistentUser);

      const sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
      if (sessionUser) return JSON.parse(sessionUser);
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  // Login action
  const login = async (email, password, rememberMe) => {
    setAuthLoading(true);
    // Add minor artificial delay to show a beautiful spinner
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setAuthLoading(false);
      return { success: false, error: 'Користувача з такою електронною адресою не знайдено' };
    }

    if (user.password !== password) {
      setAuthLoading(false);
      return { success: false, error: 'Невірний пароль' };
    }

    // Set user
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    setAuthLoading(false);
    return { success: true, user };
  };

  // Register action
  const register = async (username, email, password) => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setAuthLoading(false);
      return { success: false, error: 'Акаунт із цим email вже існує' };
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      themeMode: 'light',
      themeAccent: 'blue',
      avatarUrl: '', // Default avatar placeholder
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setAuthLoading(false);
    return { success: true };
  };

  // Logout action
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  };

  // Update user profile settings
  const updateProfile = async (updatedData) => {
    if (!currentUser) return { success: false, error: 'Користувач не авторизований' };
    
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update in users list
    let errorMsg = null;
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        // Validate password change if provided
        if (updatedData.newPassword) {
          if (u.password !== updatedData.currentPassword) {
            errorMsg = 'Поточний пароль введено неправильно';
            return u;
          }
          return { ...u, username: updatedData.username, password: updatedData.newPassword, avatarUrl: updatedData.avatarUrl || u.avatarUrl };
        }
        return { ...u, username: updatedData.username, avatarUrl: updatedData.avatarUrl || u.avatarUrl };
      }
      return u;
    });

    if (errorMsg) {
      setAuthLoading(false);
      return { success: false, error: errorMsg };
    }

    const updatedUser = updatedUsers.find((u) => u.id === currentUser.id);

    setUsers(updatedUsers);
    setCurrentUser(updatedUser);

    // Sync active session
    if (localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem(CURRENT_USER_KEY)) {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    setAuthLoading(false);
    return { success: true, user: updatedUser };
  };

  // Sync user settings (like Theme) back to local users database
  const syncUserSettings = (themeMode, themeAccent) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, themeMode, themeAccent };
    setCurrentUser(updatedUser);

    if (localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem(CURRENT_USER_KEY)) {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, themeMode, themeAccent } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        authLoading,
        login,
        register,
        logout,
        updateProfile,
        syncUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
