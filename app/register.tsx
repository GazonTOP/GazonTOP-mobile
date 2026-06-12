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
import { ArrowLeftIcon, UserIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon, CheckIcon } from '../src/components/ui/Icons';
import { useAuthStore } from '../src/store/authStore';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const login = useAuthStore((s) => s.login);

  // Register button onPress:


  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a0d0d', '#0d0d0d', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.bgPattern}>
        <Text style={styles.bgEmoji}>🏆</Text>
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
              <Text style={styles.subtitle}>{t('register.joinLeague')}</Text>
              <Text style={styles.title}>
                {t('register.title')}{' '}
                <Text style={styles.titleAccent}>{t('register.titleAccent')}</Text>
              </Text>
              <Text style={styles.titleDesc}>{t('register.desc')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>

              {/* Full Name */}
              <View>
                <Text style={styles.label}>{t('register.fullName')}</Text>
                <View style={styles.inputWrap}>
                  <View style={styles.inputIcon}>
                    <UserIcon color={Colors.textMuted} size={18} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder={t('register.namePlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Phone */}
              <View>
                <Text style={styles.label}>{t('register.phoneNumber')}</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+998</Text>
                  </View>
                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <TextInput
                      style={[styles.inputField, { paddingLeft: 16 }]}
                      placeholder={t('register.phonePlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View>
                <Text style={styles.label}>{t('register.email')}</Text>
                <View style={styles.inputWrap}>
                  <View style={styles.inputIcon}>
                    <MailIcon color={Colors.textMuted} size={18} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder={t('register.emailPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Text style={styles.label}>{t('register.password')}</Text>
                <View style={styles.inputWrap}>
                  <View style={styles.inputIcon}>
                    <LockIcon color={Colors.textMuted} size={18} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder={t('register.passwordPlaceholder')}
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

              {/* Terms */}
              <View style={styles.termsRow}>
                <View style={styles.checkbox}>
                  <CheckIcon color={Colors.neonDark} size={12} />
                </View>
                <Text style={styles.termsText}>
                  {t('register.terms')}
                  <Text style={styles.termsLink}>{t('register.termsLink')}</Text>
                  {t('register.and')}
                  <Text style={styles.termsLink}>{t('register.privacyLink')}</Text>
                  {t('register.termsEnd')}
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity style={styles.registerBtn} onPress={() => {
                login();
                router.replace('/(tabs)');
              }} activeOpacity={0.85}>
                <LinearGradient colors={[Colors.neon, '#a8d424']} style={styles.registerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.registerBtnText}>{t('register.registerBtn')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>{t('register.haveAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)}>
                  <Text style={styles.loginLink}>{t('register.signIn')}</Text>
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
  bgPattern: { position: 'absolute', top: 40, right: -30, opacity: 0.06 },
  bgEmoji: { fontSize: 220 },
  bgFade: { position: 'absolute', top: 160, left: 0, right: 0, height: 200 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 0.5, borderColor: Colors.border },
  titleBlock: { marginTop: 32, marginBottom: 32 },
  subtitle: { fontSize: 11, color: Colors.neon, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  title: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, lineHeight: 40 },
  titleAccent: { color: Colors.neon, fontStyle: 'italic' },
  titleDesc: { fontSize: 14, color: Colors.textMuted, marginTop: 10, lineHeight: 20 },
  form: { gap: 16 },
  label: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.border, minHeight: 54 },
  inputIcon: { marginLeft: 16 },
  inputField: { flex: 1, fontSize: 15, color: Colors.textPrimary, paddingVertical: 16, paddingHorizontal: 12 },
  eyeBtn: { padding: 16 },
  phoneRow: { flexDirection: 'row', gap: 10 },
  countryCode: { backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, backgroundColor: Colors.neon, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  termsText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  termsLink: { color: Colors.neon, fontWeight: '600' },
  registerBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  registerGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { fontSize: 16, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.3 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: Colors.textMuted },
  loginLink: { fontSize: 14, color: Colors.neon, fontWeight: '700' },
});