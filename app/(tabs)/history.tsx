import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '@/components/AppButton';
import EventQRModal from '@/components/EventQRModal';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from '@/lib/attendance';

function shortId(id: string) {
  return id ? `…${id.slice(-8)}` : 'unknown';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function HistoryScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>([]);
  const [qrEvent, setQrEvent] = useState<TeacherEventAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await getProfile(user.id);
      const currentRole = profile?.role ?? 'student';

      setRole(currentRole);

      if (currentRole === 'teacher') {
        const events = await getTeacherEventAttendance(user.id);
        setTeacherEvents(events);
        setStudentRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);
        setStudentRecords(records);
        setTeacherEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <Text style={styles.loadingTitle}>Loading History</Text>
        <Text style={styles.loadingSubtitle}>
          Please wait while we retrieve your attendance records.
        </Text>
      </View>
    );
  }

  // Teacher attendance history
  if (role === 'teacher') {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>QR</Text>
          </View>

          <Text style={styles.heroTitle}>Attendance History</Text>
          <Text style={styles.heroSubtitle}>
            Manage your events and monitor student attendance.
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>
                {teacherEvents.length}
              </Text>
              <Text style={styles.heroStatLabel}>Events</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>
                {teacherEvents.reduce(
                  (total, event) => total + event.attendeeCount,
                  0
                )}
              </Text>
              <Text style={styles.heroStatLabel}>Total Scans</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>My Events</Text>
            <Text style={styles.sectionSubtitle}>
              Attendance records for your events
            </Text>
          </View>

          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>
              {teacherEvents.length}
            </Text>
          </View>
        </View>

        {teacherEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>QR</Text>
            </View>
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptyText}>
              Create an event in the Teacher tab to start tracking student
              attendance.
            </Text>
          </View>
        ) : (
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.eventIcon}>
                    <Text style={styles.eventIconText}>QR</Text>
                  </View>

                  <View style={styles.eventHeading}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventCode}>
                      Code: {item.eventCode}
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {item.attendeeCount}
                    </Text>
                    <Text style={styles.countLabel}>scans</Text>
                  </View>
                </View>

                {(item.startTime || item.endTime) && (
                  <View style={styles.timeContainer}>
                    {item.startTime && (
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>Start Time</Text>
                        <Text style={styles.timeValue}>
                          {formatDate(item.startTime)}
                        </Text>
                      </View>
                    )}

                    {item.endTime && (
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>End Time</Text>
                        <Text style={styles.timeValue}>
                          {formatDate(item.endTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.attendanceHeader}>
                  <Text style={styles.attendanceTitle}>
                    Student Attendance
                  </Text>
                  <Text style={styles.attendanceCount}>
                    {item.attendees.length} records
                  </Text>
                </View>

                {item.attendees.length === 0 ? (
                  <View style={styles.noScans}>
                    <Text style={styles.noScansText}>
                      No scans recorded for this event yet.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.attendeeList}>
                    {item.attendees.map((a) => (
                      <View
                        key={`${item.eventId}-${a.studentId}`}
                        style={styles.attendeeRow}
                      >
                        <View style={styles.studentAvatar}>
                          <Text style={styles.studentAvatarText}>
                            {(
                              (a as any).studentName ??
                              shortId(a.studentId)
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.attendeeInfo}>
                          <Text style={styles.attendeeName}>
                            {(a as any).studentName ??
                              shortId(a.studentId)}
                          </Text>
                          <Text style={styles.attendeeTime}>
                            {formatDate(a.scannedAt)}
                          </Text>
                        </View>

                        <View style={styles.checkBadge}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.actionRow}>
                  <AppButton
                    theme="primary"
                    title="View QR Code"
                    icon="qr-code-outline"
                    onPress={() => setQrEvent(item)}
                  />
                </View>
              </View>
            )}
          />
        )}

        {qrEvent && (
          <EventQRModal
            event={qrEvent}
            onClose={() => setQrEvent(null)}
          />
        )}
      </View>
    );
  }

  // Student attendance history
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>QR</Text>
        </View>

        <Text style={styles.heroTitle}>My Attendance</Text>
        <Text style={styles.heroSubtitle}>
          Keep track of the events you have attended.
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>
              {studentRecords.length}
            </Text>
            <Text style={styles.heroStatLabel}>Attendance Records</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>
            Your recorded attendance
          </Text>
        </View>

        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>
            {studentRecords.length}
          </Text>
        </View>
      </View>

      {studentRecords.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>QR</Text>
          </View>
          <Text style={styles.emptyTitle}>No Attendance Yet</Text>
          <Text style={styles.emptyText}>
            Your attendance records will appear here after you scan an event
            QR code.
          </Text>
        </View>
      ) : (
        <FlatList
          data={studentRecords}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.studentRecordRow}>
                <View style={styles.eventIcon}>
                  <Text style={styles.eventIconText}>✓</Text>
                </View>

                <View style={styles.recordInfo}>
                  <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                  <Text style={styles.eventMeta}>
                    Event ID: {item.eventId}
                  </Text>
                  <Text style={styles.eventMeta}>
                    {formatDate(item.scannedAt)}
                  </Text>
                </View>

                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>

              <View style={styles.recordFooter}>
                <View style={styles.recordStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.recordStatusText}>Recorded</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#E4EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15366F',
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#71809A',
    textAlign: 'center',
    lineHeight: 21,
  },

  hero: {
    backgroundColor: '#2459C4',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIconText: {
    color: '#2459C4',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 7,
  },
  heroSubtitle: {
    color: '#E1EAFF',
    fontSize: 13,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  heroStat: {
    flex: 1,
  },
  heroStatNumber: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: '#E1EAFF',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#183568',
    fontSize: 19,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#7A88A0',
    fontSize: 12,
    marginTop: 4,
  },
  sectionBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#E1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    color: '#2459C4',
    fontWeight: '800',
    fontSize: 13,
  },

  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7EDFA',
    shadowColor: '#244A8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  eventIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIconText: {
    color: '#2459C4',
    fontSize: 15,
    fontWeight: '900',
  },
  eventHeading: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  eventTitle: {
    color: '#19366B',
    fontSize: 15,
    fontWeight: '800',
  },
  eventCode: {
    color: '#71809A',
    fontSize: 12,
    marginTop: 5,
  },
  countBadge: {
    backgroundColor: '#E5F6EC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
    minWidth: 54,
  },
  countText: {
    color: '#21834A',
    fontSize: 16,
    fontWeight: '800',
  },
  countLabel: {
    color: '#21834A',
    fontSize: 10,
    marginTop: 1,
  },

  timeContainer: {
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  timeRow: {
    marginBottom: 7,
  },
  timeLabel: {
    color: '#7A88A0',
    fontSize: 11,
    marginBottom: 3,
  },
  timeValue: {
    color: '#30466D',
    fontSize: 12,
    fontWeight: '600',
  },

  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attendanceTitle: {
    color: '#243D6B',
    fontSize: 13,
    fontWeight: '800',
  },
  attendanceCount: {
    color: '#8793A8',
    fontSize: 11,
  },
  attendeeList: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1F9',
    paddingTop: 5,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FA',
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#2459C4',
    fontWeight: '800',
    fontSize: 13,
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  attendeeName: {
    color: '#243D6B',
    fontSize: 12,
    fontWeight: '700',
  },
  attendeeTime: {
    color: '#8591A6',
    fontSize: 10,
    marginTop: 4,
  },
  checkBadge: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#21834A',
    fontWeight: '900',
    fontSize: 14,
  },
  noScans: {
    backgroundColor: '#F5F8FF',
    padding: 13,
    borderRadius: 12,
  },
  noScansText: {
    color: '#7B89A1',
    fontSize: 12,
    textAlign: 'center',
  },
  actionRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F9',
  },

  studentRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  eventMeta: {
    color: '#7C8AA2',
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  recordFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1F9',
    marginTop: 14,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7EE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#21834A',
    marginRight: 6,
  },
  recordStatusText: {
    color: '#21834A',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EDFA',
    marginTop: 8,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  emptyIconText: {
    color: '#2459C4',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyTitle: {
    color: '#19366B',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#7A88A0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
  },
});
