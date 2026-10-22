import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { COLORS } from '@/constants/colors';
import type { TeacherEventAttendance } from '@/lib/attendance';
import { buildQRPayload } from '@/lib/qr';

type Props = {
  event: TeacherEventAttendance;
  onClose: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function EventQRModal({ event, onClose }: Props) {
  const payload =
    event.qrPayload ||
    buildQRPayload({
      eventId: event.eventCode,
      title: event.title,
      start: event.startTime ?? undefined,
      end: event.endTime ?? undefined,
    });

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{event.eventCode}</Text>
          {event.startTime && (
            <Text style={styles.meta}>Starts: {formatDate(event.startTime)}</Text>
          )}
          {event.endTime && (
            <Text style={styles.meta}>Ends: {formatDate(event.endTime)}</Text>
          )}

          <View style={styles.qrBox}>
            <QRCode value={payload} size={220} />
          </View>

          <Text style={styles.hint}>Students scan this from the Scan tab.</Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 31, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginVertical: 16,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
  },
  closeText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});