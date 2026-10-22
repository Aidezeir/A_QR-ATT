import { Redirect, router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { useRole } from '@/lib/auth';

export default function Index() {
  const { role, roleLoading } = useRole();

  if (!roleLoading && role === 'admin') {
    return <Redirect href="/(tabs)/admin" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.topAccent} />

        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>QR</Text>
          </View>

          <Header title="QR Attendance" />

          <Text style={styles.byLine}>
            by: Aidezeir P. Melgar
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.bodyContainer}>
        <View style={styles.welcomeBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>SCHOOL ATTENDANCE SYSTEM</Text>
        </View>

        <Text style={styles.mainTitle}>
          School Event{'\n'}
          <Text style={styles.titleAccent}>Attendance</Text>
        </Text>

        <Text style={styles.subtitle}>
          Make every school activity easier to manage. Scan QR codes
          to record your attendance and keep track of your event history.
        </Text>

        {/* Feature Card */}
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>QR</Text>
          </View>

          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Quick & Easy Check-in</Text>
            <Text style={styles.featureDescription}>
              A simple way to record attendance at school events.
            </Text>
          </View>

          <View style={styles.featureArrow}>
            <Text style={styles.arrowText}>✓</Text>
          </View>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footerContainer}>
        <Text style={styles.sectionTitle}>Get Started</Text>
        <Text style={styles.sectionSubtitle}>
          Choose what you want to do.
        </Text>

        <View style={styles.buttonSpacing}>
          <AppButton
            theme="primary"
            title="Scan QR Code"
            icon="qr-code-outline"
            onPress={() => router.push('/scan')}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <AppButton
            title="Attendance History"
            icon="time-outline"
            onPress={() => router.push('/history')}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <AppButton
            title="Profile"
            icon="person-outline"
            onPress={() => router.push('/profile')}
          />
        </View>

        <Text style={styles.footerText}>
          QR Attendance · School Event Management
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  topAccent: {
    height: 5,
    width: 48,
    borderRadius: 10,
    backgroundColor: '#2459C4',
    marginBottom: 20,
  },
  brandContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7EDFA',
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#2459C4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2459C4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
  },
  byLine: {
    fontSize: 12,
    color: '#7A88A0',
    marginTop: 8,
    textAlign: 'center',
  },

  bodyContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E5EDFF',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 16,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2459C4',
    marginRight: 7,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#2459C4',
  },
  mainTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    color: '#19366B',
    marginBottom: 12,
  },
  titleAccent: {
    color: '#2459C4',
  },
  subtitle: {
    fontSize: 13,
    color: '#71809A',
    lineHeight: 21,
  },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EDFA',
    padding: 14,
    marginTop: 22,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    color: '#2459C4',
    fontSize: 15,
    fontWeight: '900',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  featureTitle: {
    color: '#19366B',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  featureDescription: {
    color: '#7A88A0',
    fontSize: 11,
    lineHeight: 16,
  },
  featureArrow: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#21834A',
    fontSize: 14,
    fontWeight: '900',
  },

  footerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#19366B',
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7A88A0',
    marginTop: 4,
    marginBottom: 14,
  },
  buttonSpacing: {
    marginBottom: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#98A4B8',
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
});
