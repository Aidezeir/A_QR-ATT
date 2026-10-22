import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth, signOut } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
    setDraftName(p?.full_name ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      full_name: draftName.trim(),
    });
    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setProfile((prev) =>
        prev ? { ...prev, full_name: draftName.trim() } : prev
      );
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>QR</Text>
        </View>

        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>
          Manage your account information
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.full_name || user?.email || 'U')
              .charAt(0)
              .toUpperCase()}
        </Text>
        </View>

        <Text style={styles.displayName}>
          {profile?.full_name || 'Welcome!'}
        </Text>
        <Text style={styles.emailPreview}>
          {user?.email || ''}
        </Text>

        {profile?.role === 'teacher' ? (
          <View style={[styles.roleBadge, styles.teacherBadge]}>
            <Text style={styles.roleBadgeText}>TEACHER</Text>
          </View>
        ) : profile?.role === 'admin' ? (
          <View style={[styles.roleBadge, styles.adminBadge]}>
            <Text style={styles.roleBadgeText}>ADMIN</Text>
          </View>
        ) : (
          <View style={[styles.roleBadge, styles.studentBadge]}>
            <Text style={styles.roleBadgeText}>STUDENT</Text>
          </View>
        )}
      </View>

      {user && (
        <View style={styles.infoCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>

          <Text style={styles.label}>Full Name</Text>

          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textSecondary}
                editable={!saving}
              />

              <Pressable
                style={styles.saveButton}
                onPress={handleSaveName}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.textOnPrimary}
                  />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setEditing(true)}
              style={styles.nameRow}
            >
              <Text style={styles.value}>
                {profile?.full_name || 'Tap to add your name'}
              </Text>
              <Text style={styles.editHint}>Edit</Text>
            </Pressable>
          )}

          <View style={styles.separator} />

          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{user.email}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Account Role</Text>
          <Text style={styles.value}>
            {profile?.role ?? 'student'}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user.id}</Text>
        </View>
      )}

      <View style={styles.signOutSection}>
        <AppButton
          title="Sign Out"
          icon="log-out-outline"
          onPress={handleSignOut}
          disabled={loading}
        />
        <Text style={styles.footerText}>QR Attendance System</Text>
      </View>
    </ScrollView>
  );
}

const BLUE = '#1769D2';
const DARK_BLUE = '#124A9C';
const LIGHT_BLUE = '#EAF3FF';
const PAGE_BACKGROUND = '#F4F8FE';
const CARD_WHITE = '#FFFFFF';
const BORDER_COLOR = '#DFE8F5';
const TEXT_DARK = '#172B4D';
const TEXT_MUTED = '#72819A';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: DARK_BLUE,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 2,
    shadowColor: '#183B70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: LIGHT_BLUE,
    borderWidth: 3,
    borderColor: '#D4E6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: BLUE,
    fontSize: 30,
    fontWeight: '800',
  },
  displayName: {
    color: TEXT_DARK,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emailPreview: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  roleBadge: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginTop: 14,
  },
  teacherBadge: {
    backgroundColor: '#E2EEFF',
  },
  adminBadge: {
    backgroundColor: '#DCE9FF',
  },
  studentBadge: {
    backgroundColor: '#E8F2FF',
  },
  roleBadgeText: {
    color: DARK_BLUE,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 2,
    shadowColor: '#183B70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAccent: {
    width: 5,
    height: 22,
    borderRadius: 4,
    backgroundColor: BLUE,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: '600',
    lineHeight: 22,
  },
  valueSmall: {
    fontSize: 11,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 12,
  },
  editHint: {
    fontSize: 13,
    fontWeight: '800',
    color: BLUE,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8D9F0',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: TEXT_DARK,
  },
  saveButton: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAF0F8',
    marginTop: 14,
    marginBottom: 10,
  },
  signOutSection: {
    marginTop: 2,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#98A6BA',
    marginTop: 16,
  },
});
