import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from 'expo-router';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { createEvent } from '@/lib/events';
import { buildQRPayload } from '@/lib/qr';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

function toLocalISO(date: Date) {
  return date.toISOString();
}

function formatDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });

  return `${month} ${pad(date.getDate())}, ${date.getFullYear()} at ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const QUICK_END_OPTIONS = [
  { label: '+30 min', ms: 30 * 60 * 1000 },
  { label: '+1 hour', ms: 60 * 60 * 1000 },
  { label: '+2 hours', ms: 2 * 60 * 60 * 1000 },
];

type EditTarget = 'start' | 'end';

export default function TeacherScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000)
  );
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editingPart, setEditingPart] = useState<'date' | 'time'>('date');
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isAndroid = Platform.OS === 'android';

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!user) {
        setRoleLoading(false);
        return () => {
          active = false;
        };
      }

      getProfile(user.id).then((profile) => {
        if (!active) return;
        setRole(profile?.role ?? 'student');
        setRoleLoading(false);
      });

      return () => {
        active = false;
      };
    }, [user])
  );

  const openPicker = (target: EditTarget) => {
    setMessage(null);
    setEditTarget(target);
    setEditingPart('date');
  };

  const onPickerChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (!editTarget) return;

    if (event.type === 'dismissed' || !selected) {
      setEditTarget(null);
      setEditingPart('date');
      return;
    }

    const current = editTarget === 'start' ? startDate : endDate;
    const next = new Date(current);

    next.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    if (editTarget === 'start') setStartDate(next);
    else setEndDate(next);

    if (isAndroid && editingPart === 'date') {
      setEditingPart('time');
    } else {
      setEditTarget(null);
      setEditingPart('date');
    }
  };

  const handleQuickEnd = (ms: number) => {
    setMessage(null);
    setEndDate(new Date(startDate.getTime() + ms));
  };

  const handleCreateEvent = () => {
    const event = {
      eventId: eventId.trim(),
      title: title.trim(),
      start: toLocalISO(startDate),
      end: toLocalISO(endDate),
    };

    if (!event.eventId || !event.title) {
      setMessage('Event title and code are required.');
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setMessage('End time must be after start time.');
      return;
    }

    createEvent(event).then(({ error }) => {
      if (error) {
        setMessage('Could not save the event. Please try again.');
        return;
      }

      setMessage('Event saved! Scan the QR with the Scan tab to test it.');
      setPayload(buildQRPayload(event));
    });
  };

  if (roleLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicatorFallback />
        <Text style={styles.loadingText}>Checking your account...</Text>
      </View>
    );
  }

  if (role !== 'teacher') {
    return (
      <View style={styles.center}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed-outline" size={38} color={BLUE} />
        </View>
        <Text style={styles.lockTitle}>Teachers Only</Text>
        <Text style={styles.lockSubtitle}>
          Only teacher accounts can create events.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="qr-code-outline" size={30} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Create Event QR</Text>
        <Text style={styles.subtitle}>
          Set up your event details and generate a QR code for attendance.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Event Details</Text>
        </View>

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Founders Day Assembly"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Event Code</Text>
        <TextInput
          style={styles.input}
          value={eventId}
          onChangeText={setEventId}
          placeholder="e.g. EVT-2026-0002"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Start Date and Time</Text>
        <PickerField
          value={formatDateTime(startDate)}
          icon="sunny-outline"
          onPress={() => openPicker('start')}
        />

        <Text style={styles.label}>End Date and Time</Text>
        <PickerField
          value={formatDateTime(endDate)}
          icon="moon-outline"
          onPress={() => openPicker('end')}
        />

        <Text style={styles.quickLabel}>Quick end time</Text>

        <View style={styles.chipRow}>
          {QUICK_END_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              style={styles.chip}
              onPress={() => handleQuickEnd(option.ms)}
            >
              <Text style={styles.chipText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.hint}>
          Choose how long the event should last.
        </Text>

        {message && (
          <View style={styles.messageBox}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={BLUE}
            />
            <Text style={styles.message}>{message}</Text>
          </View>
        )}

        <View style={styles.createButton}>
          <AppButton
            theme="primary"
            title="Create Event"
            icon="add-circle-outline"
            onPress={handleCreateEvent}
          />
        </View>
      </View>

      {editTarget && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={editTarget === 'start' ? startDate : endDate}
            mode={isAndroid ? editingPart : 'datetime'}
            display={isAndroid ? 'default' : 'spinner'}
            onChange={onPickerChange}
          />
        </View>
      )}

      {payload && (
        <View style={styles.resultCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Event QR Code</Text>
          </View>

          <Text style={styles.resultTitle}>
            Scan this QR code with the Scan tab:
          </Text>

          <View style={styles.qrBox}>
            <QRCode value={payload} size={200} />
          </View>

          <Text style={styles.payloadText}>{payload}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function ActivityIndicatorFallback() {
  return (
    <View style={styles.loadingIcon}>
      <Ionicons name="time-outline" size={30} color={BLUE} />
    </View>
  );
}

type PickerFieldProps = {
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function PickerField({ value, icon, onPress }: PickerFieldProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pickerField,
        pressed && styles.pickerFieldPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={BLUE} />
      <Text style={styles.pickerValue}>{value}</Text>
      <Ionicons name="calendar-outline" size={18} color={TEXT_MUTED} />
    </Pressable>
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
  container: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  lockIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lockTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: DARK_BLUE,
    marginTop: 8,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 21,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 22,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: DARK_BLUE,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 2,
    shadowColor: '#183B70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8D9F0',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: TEXT_DARK,
  },
  pickerField: {
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8D9F0',
    paddingHorizontal: 13,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerFieldPressed: {
    backgroundColor: LIGHT_BLUE,
  },
  pickerValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginHorizontal: 10,
    lineHeight: 20,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginTop: 18,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  chip: {
    backgroundColor: LIGHT_BLUE,
    borderWidth: 1,
    borderColor: '#D4E6FF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
  },
  hint: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    lineHeight: 18,
  },
  pickerContainer: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: DARK_BLUE,
    lineHeight: 19,
  },
  createButton: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 2,
    shadowColor: '#183B70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  payloadText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
})