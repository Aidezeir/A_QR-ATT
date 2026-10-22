import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { COLORS } from '@/constants/colors';
import { useRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
};

type AttendanceRow = {
  id: string;
  student_id: string;
  event_id: string;
  scanned_at: string;
  studentName: string;
  eventTitle: string;
};

export default function AdminScreen() {
  const { role, roleLoading } = useRole();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (roleLoading || role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [usersResult, attendanceResult, eventsResult] = await Promise.all([
      supabase.from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('attendance')
        .select('id, student_id, event_id, scanned_at')
        .order('scanned_at', { ascending: false })
        .limit(500),
      supabase.from('events').select('id, title, event_code'),
    ]);

    if (usersResult.error || attendanceResult.error || eventsResult.error) {
      setError(
        usersResult.error?.message ??
        attendanceResult.error?.message ??
        eventsResult.error?.message ??
        'Could not load admin data.'
      );
      setLoading(false);
      return;
    }

    const userRows = (usersResult.data ?? []) as UserRow[];
    const attendanceRows = attendanceResult.data ?? [];
    const eventRows = eventsResult.data ?? [];
    const userMap: Record<string, string> = {};
    const eventMap: Record<string, string> = {};

    userRows.forEach((u) => {
      userMap[u.id] = u.full_name || u.email || 'Unknown user';
    });
    eventRows.forEach((e: any) => {
      eventMap[e.id] = e.title || e.event_code || 'Untitled event';
    });

    setUsers(userRows);
    setAttendance(attendanceRows.map((a: any) => ({
      id: a.id,
      student_id: a.student_id,
      event_id: a.event_id,
      scanned_at: a.scanned_at,
      studentName: userMap[a.student_id] || 'Unknown student',
      eventTitle: eventMap[a.event_id] || 'Unknown event',
    })));
    setLoading(false);
  }, [role, roleLoading]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (roleLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Loading admin dashboard…</Text>
      </View>
    );
  }

  if (role !== 'admin') {
    return (
      <View style={styles.center}>
        <View style={styles.lockIcon}>
          <Text style={styles.lockIconText}>!</Text>
        </View>
        <Text style={styles.heading}>Admin access only</Text>
        <Text style={styles.muted}>
          This account is not authorized to view this page.
        </Text>
      </View>
    );
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      !normalizedSearch ||
      (u.full_name ?? '').toLowerCase().includes(normalizedSearch) ||
      u.email.toLowerCase().includes(normalizedSearch);

    return matchesRole && matchesSearch;
  });

  const studentCount = users.filter((u) => u.role === 'student').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#1769E8" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Dashboard header */}
      <View style={styles.heroCard}>
        <View style={styles.heroCircleOne} />
        <View style={styles.heroCircleTwo} />
        <View style={styles.heroContent}>
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>QR-ATT • ADMINISTRATION</Text>
          </View>
          <Text style={styles.heroTitle}>Admin Dashboard</Text>
          <Text style={styles.heroSubtitle}>
            Manage users and monitor school attendance.
          </Text>
          <View style={styles.heroBottom}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroStatusText}>System overview</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {/* Summary cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.sectionCaption}>Registered accounts</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.usersCard]}>
          <View style={styles.statIconBox}>
            <Text style={styles.statIcon}>♙</Text>
          </View>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>All Users</Text>
          <Text style={styles.statHint}>Total accounts</Text>
        </View>

        <View style={[styles.statCard, styles.studentsCard]}>
          <View style={styles.statIconBox}>
            <Text style={styles.statIcon}>▤</Text>
          </View>
          <Text style={styles.statNumber}>{studentCount}</Text>
          <Text style={styles.statLabel}>Students</Text>
          <Text style={styles.statHint}>Student accounts</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.teachersCard]}>
          <View style={styles.statIconBox}>
            <Text style={styles.statIcon}>♧</Text>
          </View>
          <Text style={styles.statNumber}>{teacherCount}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
          <Text style={styles.statHint}>Teacher accounts</Text>
        </View>

        <View style={[styles.statCard, styles.adminsCard]}>
          <View style={styles.statIconBox}>
            <Text style={styles.statIcon}>⚙</Text>
          </View>
          <Text style={styles.statNumber}>{adminCount}</Text>
          <Text style={styles.statLabel}>Admins</Text>
          <Text style={styles.statHint}>Administrator accounts</Text>
        </View>
      </View>

      <View style={styles.attendanceSummary}>
        <View style={styles.attendanceSummaryIcon}>
          <Text style={styles.attendanceSummaryIconText}>✓</Text>
        </View>
        <View style={styles.attendanceSummaryInfo}>
          <Text style={styles.attendanceSummaryLabel}>Attendance Records</Text>
          <Text style={styles.attendanceSummaryHint}>
            Latest records available in the system
          </Text>
        </View>
        <Text style={styles.attendanceSummaryNumber}>{attendance.length}</Text>
      </View>

      {/* User management */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Registered Users</Text>
          <Text style={styles.sectionCaption}>
            {filteredUsers.length} account{filteredUsers.length === 1 ? '' : 's'} found
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or email..."
          placeholderTextColor="#8798B2"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')} accessibilityLabel="Clear search">
            <Text style={styles.clearSearch}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['all', 'student', 'teacher', 'admin'] as const).map((item) => {
          const active = roleFilter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setRoleFilter(item)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item === 'all' ? 'All Users' : item[0].toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filteredUsers.map((u) => (
        <View key={u.id} style={styles.recordCard}>
          <View style={styles.recordTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.recordMain}>
              <Text style={styles.recordTitle} numberOfLines={1}>
                {u.full_name || 'Name not provided'}
              </Text>
              <Text style={styles.recordText} numberOfLines={2}>{u.email}</Text>
            </View>
            <View
              style={[
                styles.roleBadge,
                u.role === 'admin'
                  ? styles.adminBadge
                  : u.role === 'teacher'
                    ? styles.teacherBadge
                    : styles.studentBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  u.role === 'admin'
                    ? styles.adminBadgeText
                    : u.role === 'teacher'
                      ? styles.teacherBadgeText
                      : styles.studentBadgeText,
                ]}
              >
                {u.role}
              </Text>
            </View>
          </View>
          <View style={styles.recordDivider} />
          <Text style={styles.recordMeta}>
            Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
      ))}

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⌕</Text>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyText}>Try another search or role filter.</Text>
        </View>
      ) : null}

      {/* Attendance records */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Attendance Records</Text>
          <Text style={styles.sectionCaption}>
            Most recent scans · Up to 500 records
          </Text>
        </View>
      </View>

      {attendance.map((a) => (
        <View key={a.id} style={styles.attendanceCard}>
          <View style={styles.attendanceRecordIcon}>
            <Text style={styles.attendanceRecordIconText}>✓</Text>
          </View>
          <View style={styles.attendanceRecordMain}>
            <Text style={styles.recordTitle} numberOfLines={1}>
              {a.studentName}
            </Text>
            <Text style={styles.recordText} numberOfLines={2}>
              {a.eventTitle}
            </Text>
            <Text style={styles.recordMeta}>
              {new Date(a.scanned_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.presentBadge}>
            <Text style={styles.presentBadgeText}>Recorded</Text>
          </View>
        </View>
      ))}

      {attendance.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No attendance records</Text>
          <Text style={styles.emptyText}>
            Attendance scans will appear here when available.
          </Text>
        </View>
      ) : null}

      <Text style={styles.footerText}>QR-ATT · Attendance Management</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },
  content: {
    padding: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F4F7FD',
  },
  heroCard: {
    backgroundColor: '#1769E8',
    borderRadius: 26,
    padding: 23,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 7,
    shadowColor: '#1556B9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroCircleOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    opacity: 0.08,
    right: -65,
    top: -70,
  },
  heroCircleTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#83B8FF',
    opacity: 0.18,
    right: 20,
    bottom: -75,
  },
  heroContent: {
    gap: 7,
  },
  heroLabel: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF24',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  heroLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E5EFFF',
    lineHeight: 20,
    maxWidth: 270,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    gap: 7,
  },
  heroStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9EF0C4',
  },
  heroStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15396F',
    marginBottom: 6,
  },
  muted: {
    fontSize: 14,
    color: '#7186A8',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 21,
  },
  lockIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#E7F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  lockIconText: {
    fontSize: 28,
    color: '#1769E8',
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#15396F',
    marginBottom: 4,
  },
  sectionCaption: {
    fontSize: 12,
    color: '#8192AC',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 145,
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#1A467C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  usersCard: {
    borderTopWidth: 4,
    borderTopColor: '#287CF6',
  },
  studentsCard: {
    borderTopWidth: 4,
    borderTopColor: '#13B8A6',
  },
  teachersCard: {
    borderTopWidth: 4,
    borderTopColor: '#8B6AF6',
  },
  adminsCard: {
    borderTopWidth: 4,
    borderTopColor: '#F5A33B',
  },
  statIconBox: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1769E8',
  },
  statNumber: {
    fontSize: 27,
    fontWeight: '800',
    color: '#15396F',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E5679',
    marginTop: 2,
  },
  statHint: {
    fontSize: 10,
    color: '#8B9BB2',
    marginTop: 4,
  },
  attendanceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 2,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    elevation: 3,
    shadowColor: '#1A467C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  attendanceSummaryIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#E3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attendanceSummaryIconText: {
    color: '#10996A',
    fontSize: 23,
    fontWeight: '800',
  },
  attendanceSummaryInfo: {
    flex: 1,
  },
  attendanceSummaryLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15396F',
  },
  attendanceSummaryHint: {
    fontSize: 11,
    color: '#8192AC',
    marginTop: 4,
    lineHeight: 16,
  },
  attendanceSummaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1769E8',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE8F6',
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#1A467C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  searchIcon: {
    fontSize: 27,
    color: '#6E8AB4',
    marginRight: 8,
  },
  search: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#17345F',
  },
  clearSearch: {
    fontSize: 24,
    color: '#7D90AB',
    paddingHorizontal: 5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 15,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  filterChipActive: {
    backgroundColor: '#1769E8',
    borderColor: '#1769E8',
  },
  filterChipText: {
    color: '#6F829F',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    borderRadius: 19,
    padding: 15,
    marginBottom: 11,
    elevation: 2,
    shadowColor: '#1A467C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },
  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1769E8',
    fontSize: 19,
    fontWeight: '800',
  },
  recordMain: {
    flex: 1,
    minWidth: 0,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17396B',
  },
  recordText: {
    fontSize: 12,
    color: '#657B9B',
    marginTop: 4,
    lineHeight: 18,
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  adminBadge: {
    backgroundColor: '#FFF0D9',
  },
  adminBadgeText: {
    color: '#B46B08',
  },
  teacherBadge: {
    backgroundColor: '#EEE8FF',
  },
  teacherBadgeText: {
    color: '#6C48CC',
  },
  studentBadge: {
    backgroundColor: '#E4F8F0',
  },
  studentBadgeText: {
    color: '#12875F',
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#EDF1F8',
    marginVertical: 12,
  },
  recordMeta: {
    fontSize: 11,
    color: '#8293AC',
    marginTop: 7,
    lineHeight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    padding: 24,
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 30,
    color: '#7DA7E8',
    marginBottom: 7,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#17396B',
    fontWeight: '800',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 12,
    color: '#8293AC',
    textAlign: 'center',
    lineHeight: 18,
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    borderRadius: 19,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#1A467C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },
  attendanceRecordIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  attendanceRecordIconText: {
    color: '#11996A',
    fontSize: 21,
    fontWeight: '800',
  },
  attendanceRecordMain: {
    flex: 1,
    minWidth: 0,
  },
  presentBadge: {
    backgroundColor: '#E4F8F0',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 7,
  },
  presentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#12875F',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD3D3',
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 16,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  footerText: {
    fontSize: 11,
    color: '#9AA9BF',
    textAlign: 'center',
    marginTop: 24,
  },
});