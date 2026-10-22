import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { signUp } from '@/lib/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!email.trim() || !password || !confirmPassword || !fullName.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topDecoration}>
              <View style={styles.waveOne} />
              <View style={styles.waveTwo} />
            </View>

            <View style={styles.backRow}>
              <Link href="/login" style={styles.backLink}>
                ‹  Back to Login
              </Link>
            </View>

            <View style={styles.brandContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>▦</Text>
              </View>
              <Text style={styles.brandTitle}>QR-ATT</Text>
              <Text style={styles.brandSubtitle}>Attendance Made Easy</Text>
            </View>

            {success ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successCheck}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Check your email!</Text>
                <Text style={styles.successText}>
                  We sent a confirmation link to {email}. Click the link to verify your
                  account, then come back and sign in.
                </Text>
                <Link href="/login" style={styles.primaryLink}>
                  Back to Sign In
                </Link>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                  Fill in your details to get started
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldIcon}>♙</Text>
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="words"
                      editable={!loading}
                      accessibilityLabel="Full name"
                    />
                  </View>

                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldIcon}>✉</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      editable={!loading}
                      accessibilityLabel="Email address"
                    />
                  </View>

                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldIcon}>▣</Text>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor={COLORS.textSecondary}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                      accessibilityLabel="Password"
                    />
                  </View>

                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldIcon}>▣</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor={COLORS.textSecondary}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                      accessibilityLabel="Confirm password"
                    />
                  </View>

                  <Text style={styles.label}>I am a...</Text>
                  <View style={styles.roleRow}>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: role === 'student' }}
                      style={[
                        styles.roleChip,
                        role === 'student' && styles.roleChipActive,
                      ]}
                      onPress={() => setRole('student')}
                      disabled={loading}
                    >
                      <Text style={styles.roleIcon}>♙</Text>
                      <Text
                        style={[
                          styles.roleChipText,
                          role === 'student' && styles.roleChipTextActive,
                        ]}
                      >
                        Student
                      </Text>
                      {role === 'student' && (
                        <Text style={styles.selectedMark}>✓</Text>
                      )}
                    </Pressable>

                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: role === 'teacher' }}
                      style={[
                        styles.roleChip,
                        role === 'teacher' && styles.roleChipActive,
                      ]}
                      onPress={() => setRole('teacher')}
                      disabled={loading}
                    >
                      <Text style={styles.roleIcon}>♧</Text>
                      <Text
                        style={[
                          styles.roleChipText,
                          role === 'teacher' && styles.roleChipTextActive,
                        ]}
                      >
                        Teacher
                      </Text>
                      {role === 'teacher' && (
                        <Text style={styles.selectedMark}>✓</Text>
                      )}
                    </Pressable>
                  </View>
                </View>

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.error}>{error}</Text>
                  </View>
                )}

                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={styles.loader}
                  />
                ) : (
                  <AppButton
                    theme="primary"
                    title="Create Account"
                    icon="person-add-outline"
                    onPress={handleRegister}
                  />
                )}

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                  </Text>
                  <Link href="/login" style={styles.primaryLink}>
                    Sign In
                  </Link>
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerIcon}>🎓</Text>
              <View style={styles.footerTextContainer}>
                <Text style={styles.footerTitle}>QR-ATT</Text>
                <Text style={styles.footerText}>
                  For a smarter and more efficient school experience.
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  topDecoration: {
    position: 'absolute',
    top: -70,
    left: -30,
    right: -30,
    height: 190,
    backgroundColor: '#DCEBFF',
    borderBottomLeftRadius: 130,
    borderBottomRightRadius: 100,
    overflow: 'hidden',
  },
  waveOne: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 105,
    backgroundColor: '#2F80F7',
    borderBottomRightRadius: 150,
  },
  waveTwo: {
    position: 'absolute',
    top: 0,
    left: '43%',
    width: '80%',
    height: 65,
    backgroundColor: '#78B4FF',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    transform: [{ rotate: '-10deg' }],
  },
  backRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  backLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#164A9A',
    paddingVertical: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#1677F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 6,
    shadowColor: '#1767D9',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
  },
  logoIcon: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#12366E',
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#5790E8',
    marginTop: 2,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EAF1FC',
    elevation: 7,
    shadowColor: '#174F98',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15396F',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#7186A8',
    marginBottom: 17,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173C75',
    marginBottom: 7,
    marginTop: 12,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#D8E5F8',
    borderRadius: 15,
    backgroundColor: '#FCFDFF',
    paddingHorizontal: 13,
  },
  fieldIcon: {
    fontSize: 21,
    color: '#1B5CB6',
    width: 30,
    textAlign: 'center',
    marginRight: 7,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 10,
    fontSize: 14,
    color: '#17345F',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D8E5F8',
    borderRadius: 15,
  },
  roleChipActive: {
    backgroundColor: '#EDF5FF',
    borderColor: '#287BF1',
  },
  roleIcon: {
    fontSize: 19,
    color: '#286AC1',
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687E9F',
  },
  roleChipTextActive: {
    color: '#1465D8',
    fontWeight: '800',
  },
  selectedMark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1465D8',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD3D3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
    lineHeight: 19,
  },
  loader: {
    marginVertical: 18,
  },
  primaryLink: {
    color: '#0878F9',
    fontWeight: '800',
    fontSize: 14,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
  },
  loginText: {
    color: '#7186A8',
    fontSize: 13,
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAF1FC',
    elevation: 5,
    shadowColor: '#174F98',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  successIcon: {
    height: 62,
    width: 62,
    borderRadius: 31,
    backgroundColor: '#E5F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successCheck: {
    fontSize: 32,
    color: '#159B68',
    fontWeight: '800',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15396F',
    marginBottom: 10,
  },
  successText: {
    fontSize: 14,
    color: '#7186A8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerIcon: {
    fontSize: 29,
    marginRight: 14,
  },
  footerTextContainer: {
    flex: 1,
    maxWidth: 250,
  },
  footerTitle: {
    color: '#164A8F',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 3,
  },
  footerText: {
    fontSize: 12,
    color: '#7186A8',
    lineHeight: 17,
  },
});