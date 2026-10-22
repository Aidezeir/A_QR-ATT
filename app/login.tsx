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
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await signIn(email.trim(), password);

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
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
            {/* Decorative blue waves */}
            <View style={styles.topDecoration}>
              <View style={styles.waveOne} />
              <View style={styles.waveTwo} />
            </View>

            {/* QR-ATT branding */}
            <View style={styles.headerContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>▦</Text>
              </View>
              <Text style={styles.brandTitle}>QR-ATT</Text>
              <Text style={styles.brandSubtitle}>Attendance Made Easy</Text>
            </View>

            {/* Login card */}
            <View style={styles.formCard}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#8295B2"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                  accessibilityLabel="Email address"
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldIcon}>▣</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8295B2"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                  accessibilityLabel="Password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <View style={styles.forgotRow}>
                <Text style={styles.helperText}>
                  Keep your account secure
                </Text>
                <Link href="/register" style={styles.forgotLink}>
                  Need an account?
                </Link>
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
                  title="Login"
                  icon="log-in-outline"
                  onPress={handleLogin}
                />
              )}

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>New to QR-ATT?</Text>
                <View style={styles.divider} />
              </View>

              <Link href="/register" style={styles.registerButton}>
                Create an Account
              </Link>
            </View>

            {/* Footer */}
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
  headerContainer: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 28,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 23,
    backgroundColor: '#1677F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#1767D9',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
  },
  logoIcon: {
    fontSize: 44,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    padding: 23,
    borderWidth: 1,
    borderColor: '#EAF1FC',
    elevation: 7,
    shadowColor: '#174F98',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#15396F',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7186A8',
    lineHeight: 21,
    marginBottom: 23,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173C75',
    marginBottom: 7,
    marginTop: 14,
  },
  inputContainer: {
    minHeight: 56,
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
    minHeight: 54,
    paddingVertical: 10,
    fontSize: 14,
    color: '#17345F',
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#7186A8',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0878F9',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 17,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCE7F8',
  },
  dividerText: {
    fontSize: 12,
    color: '#7186A8',
  },
  registerButton: {
    borderWidth: 1.5,
    borderColor: '#267CF5',
    borderRadius: 14,
    paddingVertical: 15,
    textAlign: 'center',
    color: '#0878F9',
    fontSize: 14,
    fontWeight: '800',
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
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