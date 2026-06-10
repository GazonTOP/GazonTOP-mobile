import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { Colors } from '../../src/constants/colors';
import { PITCHES, REVIEWS } from '../../src/constants/mockData';

const { width: W, height: H } = Dimensions.get('window');
const IMG_H = H * 0.42;

export default function PitchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pitch = PITCHES.find((p) => p.id === id) ?? PITCHES[0];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Hero Image ── */}
        <View style={{ height: IMG_H }}>
          <Image
            source={{ uri: pitch.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top buttons */}
          <SafeAreaView style={styles.heroTop}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
              <BackIcon />
            </TouchableOpacity>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.heroBtn}>
                <ShareIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn}>
                <HeartIcon />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Hero badges */}
          <View style={styles.heroBadges}>
            {pitch.instantBook && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ TASDIQLANGAN MAYDON</Text>
              </View>
            )}
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherText}>☀️ Aniq • 25°C</Text>
            </View>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>

          {/* Name + Rating */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pitchName}>{pitch.name}</Text>
              <View style={styles.addressRow}>
                <PinIcon />
                <Text style={styles.addressText}> {pitch.address}</Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingVal}>{pitch.rating}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map((s) => (
                  <Text key={s} style={[styles.star, s <= Math.floor(pitch.rating) && styles.starActive]}>★</Text>
                ))}
              </View>
              <Text style={styles.reviewCount}>{pitch.reviewCount} SHARH</Text>
            </View>
          </View>

          {/* Info boxes */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <SizeIcon />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>O'LCHAM</Text>
                <Text style={styles.infoVal}>{pitch.size}</Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <LightIcon />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>YORUG'LIK</Text>
                <Text style={styles.infoVal}>{pitch.lights}</Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <FieldIcon />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>QOPLAMA</Text>
                <Text style={styles.infoVal}>{pitch.surface}</Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Qulayliklar</Text>
          <View style={styles.amenitiesRow}>
            {pitch.amenities?.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenityIcon(a)} {a}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>So'nggi sharhlar</Text>
            <TouchableOpacity>
              <Text style={styles.readAll}>Barchasi →</Text>
            </TouchableOpacity>
          </View>

          {REVIEWS.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{r.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1,2,3,4,5].map((s) => (
                    <Text key={s} style={[styles.starSm, s <= r.rating && styles.starActive]}>★</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Bottom Book Button ── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>${pitch.pricePerHour}<Text style={styles.bottomPriceSub}>/soat</Text></Text>
          <Text style={styles.bottomPriceLabel}>Narx</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/pitch/booking', params: { id: pitch.id } } as any)}
        >
          <LinearGradient
            colors={[Colors.neon, '#a8d424']}
            style={styles.bookBtnGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookBtnText}>Bron qilish →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function amenityIcon(name: string) {
  if (name.includes('Dush')) return '🚿';
  if (name.includes('avto')) return '🅿️';
  if (name.includes('Kafe')) return '☕';
  if (name.includes('WiFi')) return '📶';
  return '✓';
}

// ── Icons ──────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ShareIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={18} cy={5} r={3} stroke="#fff" strokeWidth={1.8} />
      <Circle cx={6} cy={12} r={3} stroke="#fff" strokeWidth={1.8} />
      <Circle cx={18} cy={19} r={3} stroke="#fff" strokeWidth={1.8} />
      <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function HeartIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function PinIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={Colors.neon} strokeWidth={1.8} />
      <Circle cx={12} cy={9} r={2.5} stroke={Colors.neon} strokeWidth={1.8} />
    </Svg>
  );
}
function SizeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function LightIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={Colors.neon} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={12} r={4} stroke={Colors.neon} strokeWidth={1.8} />
    </Svg>
  );
}
function FieldIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6l9-3 9 3v12l-9 3-9-3V6z" stroke={Colors.neon} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 3v18M3 9h18M3 15h18" stroke={Colors.neon} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingTop: 8,
  },
  heroRight: { flexDirection: 'row', gap: 10 },
  heroBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroBadges: {
    position: 'absolute', bottom: 30, left: 16,
    flexDirection: 'row', gap: 8, alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: Colors.neon, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  verifiedText: { fontSize: 10, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.5 },
  weatherBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -24, padding: 24, paddingTop: 28,
  },

  nameRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  pitchName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, marginBottom: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 13, color: Colors.textMuted },

  ratingBox: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 12, alignItems: 'center', minWidth: 90,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  ratingVal: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28 },
  starsRow: { flexDirection: 'row', gap: 1, marginVertical: 3 },
  star: { fontSize: 10, color: Colors.border },
  starActive: { color: Colors.neon },
  reviewCount: { fontSize: 8, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },

  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  infoBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, gap: 10, borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  infoTexts: { gap: 2 },
  infoLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  infoVal: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },

  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  amenityChip: {
    backgroundColor: Colors.surface, borderRadius: 25,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  amenityText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  readAll: { fontSize: 13, color: Colors.neon, fontWeight: '700' },

  reviewCard: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 16, marginBottom: 10,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  reviewAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.neon },
  reviewName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  reviewDate: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  reviewStars: { flexDirection: 'row', gap: 1 },
  starSm: { fontSize: 11, color: Colors.border },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34,
  },
  bottomPrice: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  bottomPriceSub: { fontSize: 13, color: Colors.textMuted, fontWeight: '400' },
  bottomPriceLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bookBtn: { borderRadius: 16, overflow: 'hidden' },
  bookBtnGradient: { paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
  bookBtnText: { fontSize: 15, fontWeight: '800', color: Colors.neonDark },
});