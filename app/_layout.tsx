
import { useEffect } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { useAuth, initAuth } from '@/lib/auth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    initAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const inAuthScreen =
    segments[0] === 'login' || segments[0] === 'register';

  if (!session && !inAuthScreen) {
    return <Redirect href="/login" />;
  }

  if (session && inAuthScreen) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
