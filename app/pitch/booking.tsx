import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../src/constants/colors';
import { PITCHES } from '../../src/constants/mockData';

const { width: W } = Dimensions.get('window');

const DAYS = [
  { day: 'DU', date: 13 },
  { day: 'SE', date: 14 },
  { day: 'CH', date: 15 },
  { day: 'PA', date: 16 },
  { day: 'JU', date: 17 },
  { day: 'SH', date: 18 },
  { day: 'YA', date: 19 },
];

const MORNING_SLOTS = [
  { id: 'm1', time: '08:00', available: false },
  { id: 'm2', time: '09:00', available: false },
  { id: 'm3', time: '10:00', available: true },
  { id: 'm4', time: '11:00', available: true },
];

const AFTERNOON_SLOTS = [
  { id: 'a1', time: '13:00', available: true },
  { id: 'a2', time: '14:00', available: true },
  { id: 'a3', time: '15:00', available: true },
  { id: 'a4', time: '16:00', available: false },
];

const EVENING_SLOTS = [
  { id: 'e1', time: '18:00', available: true },
  { id: 'e2', time: '19:00', available: true },
  { id: 'e3', time: '20:00', available: false },
  { id: 'e4', time: '21:00', available: true },
];

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pitch = PITCHES.find((p) => p.id === id) ?? PITCHES[0];

  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const allSlots = [...MORNING_SLOTS, ...AFTERNOON_SLOTS, ...EVENING_SLOTS];
  const selected = allSlots.find((s) => s.id === selectedSlot);

  // Navigatsiya funksiyasi
  const handleConfirm = () => {
    if (!selected) return;
    router.push({
      pathname: '/pitch/payment',
      params: { 
        id: pitch.id, 
        slot: selected.time, 
        date: `${selectedDay} May, 2025` 
      },
    } as any);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>{pitch.name.toUpperCase()}</Text>
            <Text style={styles.headerTitle}>Vaqt tanlang</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Month ── */}
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.arrowBtn}>
              <ArrowIcon dir="left" />
            </TouchableOpacity>
            <Text style={styles.monthText}>May 2025</Text>
            <TouchableOpacity style={styles.arrowBtn}>
              <ArrowIcon dir="right" />
            </TouchableOpacity>
          </View>

          {/* ── Days ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContent}>
            {DAYS.map((d) => (
              <TouchableOpacity
                key={d.date}
                style={[styles.dayItem, selectedDay === d.date && styles.dayItemActive]}
                onPress={() => setSelectedDay(d.date)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, selectedDay === d.date && styles.dayLabelActive]}>
                  {d.day}
                </Text>
                <Text style={[styles.dayNum, selectedDay === d.date && styles.dayNumActive]}>
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Legend ── */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.neon }]} />
              <Text style={styles.legendText}>Bo'sh</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
              <Text style={styles.legendText}>Band</Text>
            </View>
          </View>

          {/* ── Slots ── */}
          <SlotGroup
            title="🌅 ERTALAB"
            slots={MORNING_SLOTS}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />
          <SlotGroup
            title="☀️ TUSHDAN KEYIN"
            slots={AFTERNOON_SLOTS}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />
          <SlotGroup
            title="🌙 KECHQURUN"
            slots={EVENING_SLOTS}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* ── Bottom bar ── */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            <Text style={styles.totalLabel}>JAMI BRON</Text>
            <Text style={styles.totalPrice}>
              ${pitch.pricePerHour}
              <Text style={styles.totalPriceSub}>/soat</Text>
            </Text>
          </View>

          {selected && (
            <View style={styles.selectionChip}>
              <Text style={styles.selectionIcon}>🕐</Text>
              <Text style={styles.selectionText}>
                {selected.time}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, !selectedSlot && styles.confirmBtnDisabled]}
            disabled={!selectedSlot}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={selectedSlot ? [Colors.neon, '#a8d424'] : [Colors.surface, Colors.surface]}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.confirmText, !selectedSlot && styles.confirmTextDisabled]}>
                Bronni tasdiqlash →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

// ── Slot Group ─────────────────────────────────────────
function SlotGroup({ title, slots, selectedSlot, onSelect }: {
  title: string;
  slots: { id: string; time: string; available: boolean }[];
  selectedSlot: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.slotGroup}>
      <Text style={styles.slotGroupTitle}>{title}</Text>
      <View style={styles.slotsGrid}>
        {slots.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.slotItem,
              !s.available && styles.slotItemTaken,
              selectedSlot === s.id && styles.slotItemSelected,
            ]}
            onPress={() => s.available && onSelect(s.id)}
            disabled={!s.available}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.slotTime,
              !s.available && styles.slotTimeTaken,
              selectedSlot === s.id && styles.slotTimeSelected,
            ]}>
              {s.time}
            </Text>
            <Text style={[
              styles.slotPeriod,
              !s.available && styles.slotTimeTaken,
              selectedSlot === s.id && styles.slotPeriodSelected,
            ]}>
              {parseInt(s.time) < 12 ? 'AM' : 'PM'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Icons ──────────────────────────────────────────────
function CloseIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {dir === 'left'
        ? <Path d="M15 18l-6-6 6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        : <Path d="M9 18l6-6-6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      }
    </Svg>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16,
  },
  headerSub: { fontSize: 10, color: Colors.neon, fontWeight: '700', letterSpacing: 1.5, marginBottom: 3 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  closeBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },
  divider: { height: 0.5, backgroundColor: Colors.border, marginHorizontal: 24 },
  monthRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20,
  },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },
  monthText: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  daysContent: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  dayItem: {
    width: 52, height: 68, borderRadius: 16,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', gap: 4,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  dayItemActive: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  dayLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  dayLabelActive: { color: Colors.neonDark },
  dayNum: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  dayNumActive: { color: Colors.neonDark },
  legend: {
    flexDirection: 'row', gap: 20, paddingHorizontal: 24,
    paddingTop: 20, paddingBottom: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  slotGroup: { paddingHorizontal: 20, marginTop: 20 },
  slotGroupTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1, marginBottom: 12,
  },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotItem: {
    width: (W - 70) / 4,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border, gap: 2,
  },
  slotItemTaken: { opacity: 0.35 },
  slotItemSelected: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  slotTime: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  slotTimeTaken: { color: Colors.textMuted },
  slotTimeSelected: { color: Colors.neonDark },
  slotPeriod: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
  slotPeriodSelected: { color: Colors.neonDark },
  bottomBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 30,
    gap: 14,
  },
  bottomLeft: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  totalPrice: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  totalPriceSub: { fontSize: 12, color: Colors.textMuted, fontWeight: '400' },
  selectionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.neon + '15', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 0.5, borderColor: Colors.neon + '40',
    alignSelf: 'flex-start',
  },
  selectionIcon: { fontSize: 13 },
  selectionText: { fontSize: 12, fontWeight: '700', color: Colors.neon },
  confirmBtn: { borderRadius: 16, overflow: 'hidden' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmGradient: { paddingVertical: 17, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '800', color: Colors.neonDark },
  confirmTextDisabled: { color: Colors.textMuted },
});