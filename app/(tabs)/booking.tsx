import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { PITCHES } from '../../src/constants/mockData';

const { width: W } = Dimensions.get('window');

type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

type Booking = {
  id: string;
  pitchId: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: BookingStatus;
  players: number;
};

const MOCK_BOOKINGS: Booking[] = [
  { id: '1', pitchId: '1', date: '15 May, 2025', time: '14:00 - 15:30', duration: '1.5 soat', price: 180, status: 'upcoming', players: 10 },
  { id: '2', pitchId: '2', date: '13 May, 2025', time: '10:00 - 11:00', duration: '1 soat', price: 80, status: 'active', players: 6 },
  { id: '3', pitchId: '4', date: '10 May, 2025', time: '18:00 - 19:00', duration: '1 soat', price: 45, status: 'completed', players: 2 },
  { id: '4', pitchId: '3', date: '8 May, 2025', time: '09:00 - 10:30', duration: '1.5 soat', price: 90, status: 'completed', players: 8 },
  { id: '5', pitchId: '1', date: '5 May, 2025', time: '16:00 - 17:00', duration: '1 soat', price: 120, status: 'cancelled', players: 10 },
];

const FILTERS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Barchasi' },
  { key: 'upcoming', label: 'Rejalashtirilgan' },
  { key: 'active', label: 'Faol' },
  { key: 'completed', label: 'Tugagan' },
  { key: 'cancelled', label: 'Bekor' },
];

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  upcoming: { label: 'REJALASHTIRILGAN', color: '#2196F3', bg: '#2196F315' },
  active: { label: 'FAOL', color: Colors.neon, bg: Colors.neon + '15' },
  completed: { label: 'TUGAGAN', color: '#888', bg: '#88888815' },
  cancelled: { label: 'BEKOR', color: '#FF4444', bg: '#FF444415' },
};

export default function BookingsScreen() {
  const { isLoggedIn } = useAuthStore();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');

  if (!isLoggedIn) {
    return <NotLoggedIn />;
  }

  const filtered = activeFilter === 'all'
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter((b) => b.status === activeFilter);

  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming' || b.status === 'active');
  const totalSpent = MOCK_BOOKINGS.filter((b) => b.status === 'completed').reduce((s, b) => s + b.price, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MENING</Text>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Bronlar</Text>
              <Text style={styles.headerDot}>.</Text>
            </View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{MOCK_BOOKINGS.length}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <CalendarIcon />
            <Text style={styles.statVal}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Kelayotgan</Text>
          </View>
          <View style={styles.statCard}>
            <CheckIcon />
            <Text style={styles.statVal}>
              {MOCK_BOOKINGS.filter((b) => b.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Tugagan</Text>
          </View>
          <View style={styles.statCard}>
            <WalletIcon />
            <Text style={styles.statVal}>${totalSpent}</Text>
            <Text style={styles.statLabel}>Jami xarajat</Text>
          </View>
        </View>

        {/* Upcoming — alohida ko'rinish */}
        {upcoming.length > 0 && activeFilter === 'all' && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLeft}>
                <View style={styles.activeDot} />
                <Text style={styles.sectionTitle}>Yaqinlashmoqda</Text>
              </View>
            </View>
            {upcoming.map((b) => (
              <UpcomingCard key={b.id} booking={b} />
            ))}
          </>
        )}

        {/* Filter chips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Barchasi</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Bron topilmadi</Text>
            <Text style={styles.emptyDesc}>Bu bo'limda bronlar yo'q</Text>
          </View>
        ) : (
          filtered.map((b) => <BookingCard key={b.id} booking={b} />)
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Upcoming Card ──────────────────────────────────────
function UpcomingCard({ booking }: { booking: Booking }) {
  const pitch = PITCHES.find((p) => p.id === booking.pitchId) ?? PITCHES[0];
  const status = STATUS_CONFIG[booking.status];

  return (
    <TouchableOpacity
      style={styles.upcomingCard}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/pitch/[id]', params: { id: pitch.id } } as any)}
    >
      <Image source={{ uri: pitch.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.88)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.color + '50' }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      <View style={styles.upcomingContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.upcomingName}>{pitch.name}</Text>
          <View style={styles.upcomingMeta}>
            <Text style={styles.upcomingMetaText}>📅 {booking.date}</Text>
            <Text style={styles.upcomingMetaDot}> · </Text>
            <Text style={styles.upcomingMetaText}>🕐 {booking.time}</Text>
          </View>
          <View style={styles.upcomingTags}>
            <View style={styles.upcomingTag}>
              <Text style={styles.upcomingTagText}>⏱ {booking.duration}</Text>
            </View>
            <View style={styles.upcomingTag}>
              <Text style={styles.upcomingTagText}>👥 {booking.players} kishi</Text>
            </View>
          </View>
        </View>
        <View style={styles.upcomingRight}>
          <Text style={styles.upcomingPrice}>${booking.price}</Text>
          <Text style={styles.upcomingPriceSub}>to'langan</Text>
          <TouchableOpacity style={styles.upcomingBtn}>
            <Text style={styles.upcomingBtnText}>Ko'rish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Booking Card ───────────────────────────────────────
function BookingCard({ booking }: { booking: Booking }) {
  const pitch = PITCHES.find((p) => p.id === booking.pitchId) ?? PITCHES[0];
  const status = STATUS_CONFIG[booking.status];

  return (
    <TouchableOpacity style={styles.bookingCard} activeOpacity={0.85}>
      <Image source={{ uri: pitch.imageUrl }} style={styles.bookingCardImg} resizeMode="cover" />
      <View style={styles.bookingCardBody}>
        <View style={styles.bookingCardTop}>
          <Text style={styles.bookingName} numberOfLines={1}>{pitch.name}</Text>
          <View style={[styles.statusBadgeSmall, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusTextSmall, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.bookingMeta}>
          <Text style={styles.bookingMetaText}>📅 {booking.date}</Text>
          <Text style={styles.bookingMetaDot}> · </Text>
          <Text style={styles.bookingMetaText}>🕐 {booking.time}</Text>
        </View>

        <View style={styles.bookingBottom}>
          <View style={styles.bookingTags}>
            <View style={styles.bookingTag}>
              <Text style={styles.bookingTagText}>⏱ {booking.duration}</Text>
            </View>
            <View style={styles.bookingTag}>
              <Text style={styles.bookingTagText}>👥 {booking.players}</Text>
            </View>
          </View>
          <Text style={styles.bookingPrice}>${booking.price}</Text>
        </View>

        {/* Actions */}
        {booking.status === 'completed' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtnSecondary}>
              <Text style={styles.actionBtnSecondaryText}>Qayta bron</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnPrimary}>
              <Text style={styles.actionBtnPrimaryText}>Sharh qoldirish</Text>
            </TouchableOpacity>
          </View>
        )}
        {booking.status === 'upcoming' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtnDanger}>
              <Text style={styles.actionBtnDangerText}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnPrimary}>
              <Text style={styles.actionBtnPrimaryText}>Batafsil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Not Logged In ──────────────────────────────────────
function NotLoggedIn() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notLoggedScroll}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MENING</Text>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Bronlar</Text>
              <Text style={styles.headerDot}>.</Text>
            </View>
          </View>
        </View>

        <View style={styles.notLoggedContent}>
          <View style={styles.illustrationWrap}>
            <Text style={{ fontSize: 52 }}>📅</Text>
          </View>

          <Text style={styles.notLoggedTitle}>Bronlarni ko'rish uchun kiring</Text>
          <Text style={styles.notLoggedDesc}>
            Barcha bronlaringiz, to'lov tarixi va kelayotgan o'yinlarni bu yerda ko'rasiz
          </Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Icons ──────────────────────────────────────────────
function CalendarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={3} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M3 9h18" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 2v4M16 2v4" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 13h2M12 13h2M8 17h2" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M8 12l3 3 5-5" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WalletIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={Colors.neon} strokeWidth={1.8} />
      <Path d="M16 3H8L4 7h16l-4-4z" stroke={Colors.neon} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={16} cy={14} r={1.5} fill={Colors.neon} />
    </Svg>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 16,
  },
  headerSub: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 2 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerDot: { fontSize: 34, fontWeight: '800', color: Colors.neon, lineHeight: 36 },
  headerBadge: {
    backgroundColor: Colors.neon, width: 32, height: 32,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeText: { fontSize: 14, fontWeight: '800', color: Colors.neonDark },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16,
    gap: 10, marginBottom: 8,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 18,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  statVal: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    marginTop: 20, marginBottom: 12,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.neon },

  // Filters
  filtersContent: { paddingHorizontal: 20, gap: 8, marginBottom: 14, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25,
    borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.neonDark, fontWeight: '700' },

  // Status
  statusBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 0.5,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  statusBadgeSmall: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  statusTextSmall: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Upcoming card
  upcomingCard: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 20, overflow: 'hidden', height: 160,
    backgroundColor: Colors.surface,
  },
  upcomingContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 16, gap: 12,
  },
  upcomingName: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  upcomingMetaText: { fontSize: 11, color: '#ccc' },
  upcomingMetaDot: { color: '#666', fontSize: 11 },
  upcomingTags: { flexDirection: 'row', gap: 6 },
  upcomingTag: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  upcomingTagText: { fontSize: 10, color: '#ddd', fontWeight: '500' },
  upcomingRight: { alignItems: 'flex-end', gap: 2 },
  upcomingPrice: { fontSize: 20, fontWeight: '800', color: Colors.neon },
  upcomingPriceSub: { fontSize: 9, color: '#aaa', marginBottom: 6 },
  upcomingBtn: {
    backgroundColor: Colors.neon, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  upcomingBtnText: { fontSize: 11, fontWeight: '800', color: Colors.neonDark },

  // Booking card
  bookingCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: 18,
    overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.border,
    flexDirection: 'row',
  },
  bookingCardImg: { width: 90, height: '100%' },
  bookingCardBody: { flex: 1, padding: 12, gap: 6 },
  bookingCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  bookingMeta: { flexDirection: 'row', alignItems: 'center' },
  bookingMetaText: { fontSize: 11, color: Colors.textMuted },
  bookingMetaDot: { color: Colors.border, fontSize: 11 },
  bookingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingTags: { flexDirection: 'row', gap: 5 },
  bookingTag: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, backgroundColor: Colors.surfaceHigh,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  bookingTagText: { fontSize: 9, fontWeight: '600', color: Colors.textMuted },
  bookingPrice: { fontSize: 15, fontWeight: '800', color: Colors.neon },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtnPrimary: {
    flex: 1, backgroundColor: Colors.neon,
    paddingVertical: 8, borderRadius: 10, alignItems: 'center',
  },
  actionBtnPrimaryText: { fontSize: 11, fontWeight: '800', color: Colors.neonDark },
  actionBtnSecondary: {
    flex: 1, backgroundColor: Colors.surfaceHigh,
    paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  actionBtnSecondaryText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  actionBtnDanger: {
    flex: 1, backgroundColor: '#FF444415',
    paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#FF444430',
  },
  actionBtnDangerText: { fontSize: 11, fontWeight: '700', color: '#FF4444' },

  // Empty
  emptyBox: {
    alignItems: 'center', marginHorizontal: 16,
    paddingVertical: 56, backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: Colors.textMuted },

  // Not logged in
  notLoggedScroll: { flexGrow: 1 },
  notLoggedContent: {
    paddingHorizontal: 24, paddingTop: 8, alignItems: 'center',
  },
  illustrationWrap: {
    width: 110, height: 110, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, marginTop: 12,
    borderWidth: 0.5, borderColor: Colors.neon + '30',
    backgroundColor: Colors.neon + '10',
  },
  notLoggedTitle: {
    fontSize: 20, fontWeight: '800', color: Colors.textPrimary,
    marginBottom: 10, letterSpacing: -0.5, textAlign: 'center',
  },
  notLoggedDesc: {
    fontSize: 14, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  loginBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  loginBtnGradient: { paddingVertical: 17, alignItems: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: Colors.neonDark },
  registerBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  registerBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
});