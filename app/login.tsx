import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';
import { ArrowLeftIcon, LockIcon, EyeIcon, EyeOffIcon } from '../src/components/ui/Icons';
import { useAuthStore } from '../src/store/authStore';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

// LoginScreen ichida:
const login = useAuthStore((s) => s.login);

// Sign In button onPress:


  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a1a0d', '#0d0d0d', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.bgPattern}>
        <Text style={styles.bgEmoji}>⚽</Text>
      </View>
      <LinearGradient colors={['transparent', '#0D0D0D']} style={styles.bgFade} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeftIcon color={Colors.textPrimary} size={20} />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.subtitle}>{t('login.welcomeBack')}</Text>
              <Text style={styles.title}>
                {t('login.title')}{' '}
                <Text style={styles.titleAccent}>{t('login.titleAccent')}</Text>
              </Text>
              <Text style={styles.titleDesc}>{t('login.desc')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>

              {/* Phone */}
              <View>
                <Text style={styles.label}>{t('login.phoneNumber')}</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+998</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder={t('login.phonePlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('login.password')}</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgot}>{t('login.forgot')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrap}>
                  <View style={styles.inputIcon}>
                    <LockIcon color={Colors.textMuted} size={18} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.passInput]}
                    placeholder={t('login.passwordPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    {showPass
                      ? <EyeIcon color={Colors.neon} size={20} />
                      : <EyeOffIcon color={Colors.textMuted} size={20} />
                    }
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity style={styles.signInBtn} onPress={() => { login(); router.replace('/(tabs)');
}} activeOpacity={0.85}>
                <LinearGradient colors={[Colors.neon, '#a8d424']} style={styles.signInGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.signInText}>{t('login.signIn')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.orContinue')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Text style={styles.socialIcon}></Text>
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Register */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>{t('login.newUser')}</Text>
                <TouchableOpacity onPress={() => router.push('/register' as any)}>
                  <Text style={styles.registerLink}>{t('login.createAccount')}</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  bgPattern: { position: 'absolute', top: 60, right: -20, opacity: 0.06 },
  bgEmoji: { fontSize: 220 },
  bgFade: { position: 'absolute', top: 180, left: 0, right: 0, height: 200 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 0.5, borderColor: Colors.border },
  titleBlock: { marginTop: 40, marginBottom: 36 },
  subtitle: { fontSize: 11, color: Colors.neon, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  title: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, lineHeight: 42 },
  titleAccent: { color: Colors.neon, fontStyle: 'italic' },
  titleDesc: { fontSize: 14, color: Colors.textMuted, marginTop: 10, lineHeight: 20 },
  form: { gap: 18 },
  label: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  forgot: { fontSize: 10, color: Colors.neon, letterSpacing: 1, fontWeight: '700' },
  phoneRow: { flexDirection: 'row', gap: 10 },
  countryCode: { backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  input: { backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, fontSize: 15, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.border },
  phoneInput: { flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.border },
  inputIcon: { marginLeft: 16 },
  passInput: { flex: 1, backgroundColor: 'transparent', borderWidth: 0 },
  eyeBtn: { padding: 16 },
  signInBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  signInGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  signInText: { fontSize: 16, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 15, borderWidth: 0.5, borderColor: Colors.border },
  socialIcon: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  socialText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  registerText: { fontSize: 14, color: Colors.textMuted },
  registerLink: { fontSize: 14, color: Colors.neon, fontWeight: '700' },
});