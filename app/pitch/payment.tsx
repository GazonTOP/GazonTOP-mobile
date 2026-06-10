import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../src/constants/colors';
import { PITCHES } from '../../src/constants/mockData';

const { width: W } = Dimensions.get('window');

const PAYMENT_METHODS = [
  { id: 'card', label: 'Karta', icon: 'card' },
  { id: 'payme', label: 'Payme', icon: 'payme' },
  { id: 'click', label: 'Click', icon: 'click' },
  { id: 'cash', label: 'Naqd', icon: 'cash' },
];

export default function PaymentScreen() {
  const { id, slot, date } = useLocalSearchParams<{
    id: string; slot?: string; date?: string;
  }>();
  const pitch = PITCHES.find((p) => p.id === id) ?? PITCHES[0];

  const [method, setMethod] = useState('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const duration = 1.5; // 1 soat-u 30 minut
  const subtotal = pitch.pricePerHour * duration;
  const discount = promoApplied ? subtotal * 0.2 : 0;
  const serviceFee = 5;
  const total = subtotal - discount + serviceFee;

  // Kelgan slot (soat) asosida tugash vaqtini hisoblash mantiqi
  const formatTimeSlot = (startSlot?: string) => {
    if (!startSlot) return "14:00 - 15:30";
    const [hours, minutes] = startSlot.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endStr = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startSlot} - ${endStr}`;
  };

  const formatCard = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>To'lov</Text>
          <View style={styles.secureChip}>
            <LockSmIcon />
            <Text style={styles.secureText}>Xavfsiz</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Booking summary ── */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#1a3a1a', '#0d1a0d']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <View style={styles.summaryTop}>
              <View style={styles.summaryIcon}>
                <Text style={{ fontSize: 24 }}>⚽</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryName}>{pitch.name}</Text>
                <Text style={styles.summaryAddr}>📍 {pitch.address}</Text>
              </View>
              <View style={styles.summaryRating}>
                <Text style={styles.summaryRatingVal}>★ {pitch.rating}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryDetails}>
              <SummaryItem icon="📅" label="Sana" value={date ?? "14 May, 2025"} />
              <SummaryItem icon="🕐" label="Vaqt" value={formatTimeSlot(slot)} />
              <SummaryItem icon="⏱️" label="Davomiylik" value={`${duration} soat`} />
              <SummaryItem icon="👤" label="Format" value={pitch.format} />
            </View>
          </View>

          {/* ── Payment method ── */}
          <Text style={styles.sectionTitle}>To'lov usuli</Text>
          <View style={styles.methodsRow}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodBtn, method === m.id && styles.methodBtnActive]}
                onPress={() => setMethod(m.id)}
                activeOpacity={0.7}
              >
                <MethodIcon type={m.icon} active={method === m.id} />
                <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Card form ── */}
          {method === 'card' && (
            <View style={styles.cardForm}>
              <Text style={styles.inputLabel}>KARTA RAQAMI</Text>
              <View style={styles.inputWrap}>
                <CardInputIcon />
                <TextInput
                  style={styles.inputField}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={cardNum}
                  onChangeText={(v) => setCardNum(formatCard(v))}
                  maxLength={19}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>AMAL QILISH MUDDATI</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.inputField, { paddingLeft: 16 }]}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      value={expiry}
                      onChangeText={(v) => setExpiry(formatExpiry(v))}
                      maxLength={5}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.inputField, { paddingLeft: 16 }]}
                      placeholder="•••"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      secureTextEntry
                      value={cvv}
                      onChangeText={(v) => setCvv(v.slice(0, 3))}
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>

              {/* Save card */}
              <TouchableOpacity
                style={styles.saveRow}
                onPress={() => setSaveCard(!saveCard)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
                  {saveCard && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.saveText}>Kartani saqlash</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Non-card methods */}
          {method !== 'card' && (
            <View style={styles.altMethodInfo}>
              <View style={styles.altMethodIcon}>
                <Text style={{ fontSize: 32 }}>
                  {method === 'payme' ? '💳' : method === 'click' ? '📱' : '💵'}
                </Text>
              </View>
              <Text style={styles.altMethodTitle}>
                {method === 'payme' ? "Payme orqali to'lash"
                  : method === 'click' ? "Click orqali to'lash"
                  : "Joyda naqd to'lash"}
              </Text>
              <Text style={styles.altMethodDesc}>
                {method === 'cash'
                  ? "Maydon administratoriga bronni tasdiqlab naqd to'laysiz"
                  : "Tasdiqlash tugmasini bosganingizda ilova orqali yo'naltirilasiz"}
              </Text>
            </View>
          )}

          {/* ── Promo ── */}
          <Text style={styles.sectionTitle}>Promo kod</Text>
          <View style={styles.promoRow}>
            <View style={[styles.inputWrap, { flex: 1, borderColor: promoApplied ? Colors.neon : Colors.border }]}>
              <TextInput
                style={[styles.inputField, { paddingLeft: 16 }]}
                placeholder="Kod kiriting..."
                placeholderTextColor={Colors.textMuted}
                value={promo}
                onChangeText={setPromo}
                editable={!promoApplied}
                autoCapitalize="characters"
              />
              {promoApplied && <Text style={styles.promoCheck}>✓</Text>}
            </View>
            <TouchableOpacity
              style={[styles.promoBtn, promoApplied && styles.promoBtnApplied]}
              onPress={() => {
                if (promoApplied) {
                  setPromoApplied(false);
                  setPromo('');
                } else if (promo.length > 2) {
                  setPromoApplied(true);
                }
              }}
            >
              <Text style={[styles.promoBtnText, promoApplied && { color: '#FF4444' }]}>
                {promoApplied ? 'Bekor' : "Qo'llash"}
              </Text>
            </TouchableOpacity>
          </View>
          {promoApplied && (
            <Text style={styles.promoSuccess}>🎉 20% chegirma qo'llaniladi!</Text>
          )}

          {/* ── Price breakdown ── */}
          <Text style={styles.sectionTitle}>To'lov tafsiloti</Text>
          <View style={styles.breakdownCard}>
            <BreakdownRow
              label={`${pitch.pricePerHour}$ × ${duration} soat`}
              value={`$${subtotal}`}
            />
            {promoApplied && (
              <BreakdownRow
                label="Chegirma (20%)"
                value={`-$${discount.toFixed(0)}`}
                accent
              />
            )}
            <BreakdownRow label="Xizmat to'lovi" value={`$${serviceFee}`} />
            <View style={styles.breakdownDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Jami</Text>
              <Text style={styles.totalVal}>${total.toFixed(0)}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ── Pay button ── */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.payLabel}>To'lanadigan summa</Text>
            <Text style={styles.payAmount}>${total.toFixed(0)}</Text>
          </View>
          <TouchableOpacity
            style={styles.payBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/pitch/success' as any)}
          >
            <LinearGradient
              colors={[Colors.neon, '#a8d424']}
              style={styles.payBtnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <LockSmIcon dark />
              <Text style={styles.payBtnText}>To'lovni tasdiqlash</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

// ── Small components ───────────────────────────────────
function SummaryItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryItemIcon}>{icon}</Text>
      <Text style={styles.summaryItemLabel}>{label}</Text>
      <Text style={styles.summaryItemVal}>{value}</Text>
    </View>
  );
}

function BreakdownRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={[styles.breakdownVal, accent && { color: Colors.neon }]}>{value}</Text>
    </View>
  );
}

function MethodIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? Colors.neon : Colors.textMuted;
  if (type === 'card') return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={1} y={4} width={22} height={16} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M1 10h22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
  if (type === 'cash') return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={6} width={20} height={12} rx={2} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={2} width={14} height={20} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M12 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M9 7h6M9 11h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke={Colors.textPrimary} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CardInputIcon() {
  return (
    <View style={{ marginLeft: 14 }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Rect x={1} y={4} width={22} height={16} rx={2} stroke={Colors.textMuted} strokeWidth={1.8} />
        <Path d="M1 10h22" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function LockSmIcon({ dark }: { dark?: boolean }) {
  const color = dark ? Colors.neonDark : Colors.neon;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  secureChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.neon + '15', paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 20,
    borderWidth: 0.5, borderColor: Colors.neon + '40',
  },
  secureText: { fontSize: 11, fontWeight: '700', color: Colors.neon },

  // Summary
  summaryCard: {
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 22, overflow: 'hidden',
    padding: 18, borderWidth: 0.5, borderColor: Colors.border,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  summaryIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(200,241,53,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.neon + '30',
  },
  summaryName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  summaryAddr: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  summaryRating: {
    backgroundColor: 'rgba(200,241,53,0.15)',
    paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 10, borderWidth: 0.5, borderColor: Colors.neon + '30',
  },
  summaryRatingVal: { fontSize: 12, fontWeight: '700', color: Colors.neon },
  summaryDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  summaryDetails: { gap: 10 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryItemIcon: { fontSize: 15, width: 22 },
  summaryItemLabel: { fontSize: 13, color: Colors.textMuted, flex: 1 },
  summaryItemVal: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: Colors.textPrimary,
    paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
  },

  // Methods
  methodsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  methodBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16, gap: 6,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
  },
  methodBtnActive: {
    backgroundColor: Colors.neon + '12',
    borderColor: Colors.neon,
  },
  methodLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  methodLabelActive: { color: Colors.neon },

  // Card form
  cardForm: { paddingHorizontal: 16, gap: 14 },
  inputLabel: {
    fontSize: 10, color: Colors.textMuted,
    fontWeight: '700', letterSpacing: 1.5, marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 0.5, borderColor: Colors.border, minHeight: 54,
  },
  inputField: {
    flex: 1, fontSize: 15, color: Colors.textPrimary,
    paddingVertical: 16, paddingHorizontal: 12,
  },
  inputRow: { flexDirection: 'row', gap: 12 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxActive: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  checkmark: { fontSize: 12, fontWeight: '800', color: Colors.neonDark },
  saveText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  // Alt method
  altMethodInfo: {
    marginHorizontal: 16, padding: 20, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.border, gap: 8,
  },
  altMethodIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  altMethodTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  altMethodDesc: {
    fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 18,
  },

  // Promo
  promoRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  promoBtn: {
    backgroundColor: Colors.surface, paddingHorizontal: 18,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  promoBtnApplied: { borderColor: '#FF444440' },
  promoBtnText: { fontSize: 13, fontWeight: '700', color: Colors.neon },
  promoCheck: { fontSize: 16, color: Colors.neon, marginRight: 14 },
  promoSuccess: {
    fontSize: 12, color: Colors.neon, fontWeight: '600',
    paddingHorizontal: 20, marginTop: 8,
  },

  // Breakdown
  breakdownCard: {
    marginHorizontal: 16, backgroundColor: Colors.surface,
    borderRadius: 18, padding: 18, gap: 12,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 14, color: Colors.textMuted },
  breakdownVal: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  breakdownDivider: { height: 0.5, backgroundColor: Colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  totalVal: { fontSize: 22, fontWeight: '800', color: Colors.neon },

  // Bottom
  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  payLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  payAmount: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  payBtn: { borderRadius: 16, overflow: 'hidden' },
  payBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 24, gap: 8,
  },
  payBtnText: { fontSize: 14, fontWeight: '800', color: Colors.neonDark },
});