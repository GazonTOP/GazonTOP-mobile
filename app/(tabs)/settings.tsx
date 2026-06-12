import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/constants/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { LANGUAGES } from '../../src/i18n';

const USER = {
  name: 'Mustafo Qodirov',
  email: 'mustafo.q@gazontop.uz',
  initials: 'MQ',
  badges: 12,
  rating: 4.9,
  bonus: '850k',
  isPro: true,
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const { isLoggedIn, logout } = useAuthStore();

  if (!isLoggedIn) {
    return <NotLoggedIn />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>{t('settings.myAccount')}</Text>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>{t('settings.profile')}</Text>
              <Text style={styles.headerDot}>.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.gearBtn} activeOpacity={0.7}>
            <GearIcon />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{USER.initials}</Text>
              </View>
            </View>
            {USER.isPro && (
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>⚡ VIP</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{USER.name}</Text>
          <View style={styles.emailRow}>
            <MailSmIcon />
            <Text style={styles.userEmail}>{USER.email}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{USER.badges}</Text>
              <Text style={styles.statLabel}>{t('settings.badges')}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{USER.rating}</Text>
              <Text style={styles.statLabel}>{t('settings.rating')}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{USER.bonus}</Text>
              <Text style={styles.statLabel}>{t('settings.bonus')}</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <SectionLabel text={t('settings.accountSettings')} />
        <View style={styles.card}>
          <SettingRow icon={<UserIcon />} label={t('settings.personalInfo')} sub={t('settings.personalInfoSub')} chevron />
          <Sep />
          <SettingRow icon={<CardIcon />} label={t('settings.paymentMethods')} sub={t('settings.paymentSub')} chevron />
        </View>

        {/* Language */}
        <SectionLabel text={t('settings.language')} />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.chooseLanguage')}</Text>
          <Text style={styles.cardDesc}>{t('settings.languageDesc')}</Text>
          <View style={styles.langList}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, language === lang.code && styles.langItemActive]}
                onPress={() => setLanguage(lang.code as 'uz' | 'ru' | 'en')}
                activeOpacity={0.7}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
                  {lang.label}
                </Text>
                {language === lang.code && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <SectionLabel text={t('settings.about')} />
        <View style={styles.card}>
          <SettingRow icon={<AppIcon />} label={t('settings.version')} value="1.0.0" />
          <Sep />
          <SettingRow icon={<DocIcon />} label={t('settings.termsOfService')} chevron />
          <Sep />
          <SettingRow icon={<ShieldIcon />} label={t('settings.privacyPolicy')} chevron />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() => {
            logout();
          }}
        >
          <LogoutIcon />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NotLoggedIn() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>{t('settings.myAccount')}</Text>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>{t('settings.profile')}</Text>
              <Text style={styles.headerDot}>.</Text>
            </View>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.notLoggedContent}>

          {/* Icon */}
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationBg} />
            <LockBigIcon />
          </View>

          <Text style={styles.notLoggedTitle}>Kirish talab qilinadi</Text>
          <Text style={styles.notLoggedDesc}>
            Profil, bronlar tarixi va sozlamalarni ko'rish uchun hisobingizga kiring
          </Text>

          {/* Features */}
          <View style={styles.featuresList}>
            <FeatureItem icon="📅" text="Bronlar tarixini ko'rish" />
            <FeatureItem icon="⚡" text="Tezkor bron qilish" />
            <FeatureItem icon="🏆" text="Nishonlar va bonuslar" />
            <FeatureItem icon="🔔" text="Bildirishnomalar" />
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/login' as any)}
          >
            <LinearGradient
              colors={[Colors.neon, '#a8d424']}
              style={styles.loginBtnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginBtnText}>Kirish →</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/register' as any)}
          >
            <Text style={styles.registerBtnText}>Hisob yaratish</Text>
          </TouchableOpacity>

        </View>

        {/* Language — doim ko'rinadi */}
        <Text style={styles.sectionLabel}>TIL</Text>
        <LangMini />

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureCheck}>
        <Text style={{ fontSize: 10, color: Colors.neon, fontWeight: '800' }}>✓</Text>
      </View>
    </View>
  );
}

function LangMini() {
  const { language, setLanguage } = useSettingsStore();
  return (
    <View style={[styles.card, { marginTop: 0 }]}>
      <View style={styles.langList}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langItem, language === lang.code && styles.langItemActive]}
            onPress={() => setLanguage(lang.code as 'uz' | 'ru' | 'en')}
            activeOpacity={0.7}
          >
            <Text style={styles.langFlag}>{lang.flag}</Text>
            <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
              {lang.label}
            </Text>
            {language === lang.code && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Small components ───────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function Sep() {
  return <View style={styles.sep} />;
}

function SettingRow({ icon, label, sub, value, chevron }: {
  icon: React.ReactNode; label: string;
  sub?: string; value?: string; chevron?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={chevron ? 0.7 : 1}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {chevron && <ChevronIcon />}
    </TouchableOpacity>
  );
}

// ── Icons ──────────────────────────────────────────────
function GearIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={Colors.textPrimary} strokeWidth={1.7} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={Colors.textPrimary} strokeWidth={1.7} />
    </Svg>
  );
}

function MailSmIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
      <Rect x={2} y={4} width={20} height={16} rx={2} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M2 7l10 7 10-7" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7} r={4} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CardIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={1} y={4} width={22} height={16} rx={2} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M1 10h22" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function AppIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={2} width={14} height={20} rx={2} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M12 18h.01" stroke={Colors.neon} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function DocIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={Colors.neon} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#FF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockBigIcon() {
  return (
    <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke={Colors.neon} strokeWidth={1.5} />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={Colors.neon} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.5} fill={Colors.neon} />
    </Svg>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 8,
  },
  headerSub: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1.5, marginBottom: 2,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerDot: { fontSize: 34, fontWeight: '800', color: Colors.neon, lineHeight: 36 },
  gearBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },

  profileCard: {
    alignItems: 'center', marginHorizontal: 16,
    marginTop: 8, marginBottom: 4,
    backgroundColor: Colors.surface, borderRadius: 24,
    paddingVertical: 24, paddingHorizontal: 20,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, borderColor: Colors.neon, padding: 3,
  },
  avatar: {
    flex: 1, borderRadius: 40, backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.neon, letterSpacing: -1 },
  vipBadge: {
    position: 'absolute', bottom: -4, alignSelf: 'center',
    backgroundColor: Colors.neon, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.background,
  },
  vipText: { fontSize: 9, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.5 },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 5 },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  userEmail: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.surfaceHigh, borderRadius: 16,
    overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statSep: { width: 0.5, backgroundColor: Colors.border, marginVertical: 10 },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.neon, letterSpacing: -0.5 },
  statLabel: { fontSize: 8, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginTop: 3 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1.5, paddingHorizontal: 20,
    marginTop: 20, marginBottom: 8,
  },
  card: {
    marginHorizontal: 16, backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 14, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2,
  },
  cardDesc: { fontSize: 12, color: Colors.textMuted, paddingHorizontal: 16, paddingBottom: 10 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.neon + '15', alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.neon + '30',
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  rowValue: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  sep: { height: 0.5, backgroundColor: Colors.border, marginHorizontal: 14 },
  langList: { gap: 8, padding: 12, paddingTop: 4 },
  langItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, backgroundColor: Colors.surfaceHigh,
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  langItemActive: { backgroundColor: Colors.neon + '12', borderColor: Colors.neon },
  langFlag: { fontSize: 22 },
  langLabel: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, flex: 1 },
  langLabelActive: { color: Colors.neon },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.neon, alignItems: 'center', justifyContent: 'center',
  },
  checkText: { fontSize: 13, fontWeight: '800', color: Colors.neonDark },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 18,
    backgroundColor: '#FF444412', borderWidth: 0.5, borderColor: '#FF444430', gap: 10,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#FF4444' },

  // Not logged in
  // Not logged in — o'zgartir
notLoggedContent: {
  paddingHorizontal: 24,
  paddingTop: 8,
  alignItems: 'center',
},
illustrationWrap: {
  width: 110,
  height: 110,
  borderRadius: 32,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
  marginTop: 12,
  borderWidth: 0.5,
  borderColor: Colors.neon + '30',
  backgroundColor: Colors.neon + '10',
},
illustrationBg: {
  display: 'none', // endi kerak emas
},
notLoggedTitle: {
  fontSize: 22,
  fontWeight: '800',
  color: Colors.textPrimary,
  marginBottom: 10,
  letterSpacing: -0.5,
  textAlign: 'center',
},
notLoggedDesc: {
  fontSize: 14,
  color: Colors.textMuted,
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 28,
},
featuresList: {
  width: '100%',
  gap: 10,
  marginBottom: 24,
},
featureItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: Colors.surface,
  borderRadius: 14,
  padding: 14,
  borderWidth: 0.5,
  borderColor: Colors.border,
},
featureIconBox: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: Colors.neon + '15',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 0.5,
  borderColor: Colors.neon + '30',
},
featureText: {
  flex: 1,
  fontSize: 14,
  fontWeight: '600',
  color: Colors.textPrimary,
},
featureCheck: {
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: Colors.neon + '20',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 0.5,
  borderColor: Colors.neon + '40',
},
loginBtn: {
  width: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 12,
},
loginBtnGradient: {
  paddingVertical: 17,
  alignItems: 'center',
},
loginBtnText: {
  fontSize: 16,
  fontWeight: '800',
  color: Colors.neonDark,
},
registerBtn: {
  width: '100%',
  paddingVertical: 16,
  borderRadius: 16,
  backgroundColor: Colors.surface,
  alignItems: 'center',
  borderWidth: 0.5,
  borderColor: Colors.border,
  marginBottom: 8,
},
registerBtnText: {
  fontSize: 15,
  fontWeight: '700',
  color: Colors.textSecondary,
}
})