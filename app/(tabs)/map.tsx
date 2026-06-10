import { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Image, PanResponder, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/constants/colors';
import { PITCHES } from '../../src/constants/mockData';
import { StarIcon, PinIcon } from '../../src/components/ui/Icons';

const { width: W } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 41.2995,
  longitude: 69.2401,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const PITCH_COORDS = [
  { id: '1', latitude: 41.3015, longitude: 69.2421 },
  { id: '2', latitude: 41.2975, longitude: 69.2351 },
  { id: '3', latitude: 41.2955, longitude: 69.2461 },
  { id: '4', latitude: 41.3035, longitude: 69.2381 },
];

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const mapRef = useRef<MapView>(null);

  const SHEET_HEIGHT = 380;
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // 1-TUZATISH: selectedId orqali tanlangan maydon (pitch) ma'lumotlarini aniqlaymiz
  const selectedPitch = useMemo(() => {
    return PITCHES.find((p) => p.id === selectedId) || null;
  }, [selectedId]);

  // Sheet ochish
  const openSheet = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // Sheet yopish
  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setSelectedId(null));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > SHEET_HEIGHT / 2.5 || g.vy > 0.8) {
          closeSheet();
        } else {
          openSheet();
        }
      },
    })
  ).current;

  const handleMarkerPress = (id: string) => {
    setSelectedId(id);
    const coords = PITCH_COORDS.find((c) => c.id === id);
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude - 0.008,
        longitude: coords.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }, 500);
    }
    translateY.setValue(SHEET_HEIGHT);
    setTimeout(() => openSheet(), 50);
  };

  // 2-TUZATISH: Xarita bo'sh joyiga bosilganda sheet ham yopilishi kerak
  const handleMapPress = () => {
    if (selectedId) {
      closeSheet();
    }
  };

  return (
    <View style={styles.root}>

      {/* ── MAP ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        onPress={handleMapPress} // Yangilangan funksiya
      >
        {PITCHES.map((pitch, i) => {
          const coord = PITCH_COORDS[i];
          // Agarda PITCHES va PITCH_COORDS uzunligi mos kelmasa xato bermasligi uchun tekshiruv
          if (!coord) return null; 
          
          const isSelected = selectedId === pitch.id;
          return (
            <Marker
              key={pitch.id}
              coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
              onPress={() => handleMarkerPress(pitch.id)}
            >
              <View style={styles.markerWrap}>
                {isSelected ? (
                  <View style={styles.markerLarge}>
                    <Text style={styles.markerLargeText}>{pitch.name.split(' ')[0]}</Text>
                  </View>
                ) : (
                  <View style={styles.markerDot}>
                    <View style={styles.markerDotInner} />
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── TOP BAR ── */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live: Toshkent</Text>
        </View>
        <TouchableOpacity
          style={[styles.topBtn, filterActive && styles.topBtnActive]}
          onPress={() => setFilterActive(!filterActive)}
        >
          <LayerIcon active={filterActive} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── BOTTOM SHEET ── */}
      {selectedPitch && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Handle */}
          <View {...panResponder.panHandlers} style={styles.handleWrap}>
            <View style={styles.handle} />
            <Text style={styles.handleHint}>Yopish uchun pastga torting</Text>
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Yaqinidagi maydonlar</Text>
            <View style={styles.foundBadge}>
              <Text style={styles.foundText}>{PITCHES.length} TA</Text>
            </View>
          </View>

          {/* Selected pitch */}
          <TouchableOpacity
            style={styles.selectedCard}
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/pitch/[id]',
              params: { id: selectedPitch.id },
            } as any)}
          >
            <Image
              source={{ uri: selectedPitch.imageUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.selectedCardContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selectedPitch.name}</Text>
                <View style={styles.selectedMeta}>
                  <PinIcon size={11} color="#aaa" />
                  <Text style={styles.selectedMetaText}> {selectedPitch.distance} · {selectedPitch.address}</Text>
                </View>
                <View style={styles.selectedTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{selectedPitch.format}</Text>
                  </View>
                  <View style={[styles.tag, styles.tagActive]}>
                    <Text style={[styles.tagText, { color: Colors.neon }]}>
                      {selectedPitch.isActive ? '● FAOL' : '● YOPIQ'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.selectedRight}>
                <View style={styles.ratingRow}>
                  <StarIcon size={11} color={Colors.neon} />
                  <Text style={styles.ratingText}> {selectedPitch.rating}</Text>
                </View>
                <Text style={styles.selectedPrice}>${selectedPitch.pricePerHour}</Text>
                <Text style={styles.selectedPriceSub}>/soat</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Horizontal list */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {PITCHES.map((pitch) => (
              <TouchableOpacity
                key={pitch.id}
                style={[
                  styles.pitchCard,
                  selectedId === pitch.id && styles.pitchCardActive,
                ]}
                onPress={() => handleMarkerPress(pitch.id)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: pitch.imageUrl }}
                  style={styles.pitchCardImg}
                  resizeMode="cover"
                />
                <View style={styles.pitchCardBody}>
                  <Text style={styles.pitchCardName} numberOfLines={1}>
                    {pitch.name}
                  </Text>
                  <Text style={styles.pitchCardMeta}>📍 {pitch.distance}</Text>
                  <View style={styles.pitchCardBottom}>
                    <View style={[
                      styles.activeTag,
                      { backgroundColor: pitch.isActive ? Colors.neon + '20' : Colors.surfaceHigh },
                    ]}>
                      <Text style={[
                        styles.activeTagText,
                        { color: pitch.isActive ? Colors.neon : Colors.textMuted },
                      ]}>
                        {pitch.isActive ? 'FAOL' : 'YOPIQ'}
                      </Text>
                    </View>
                    <Text style={styles.pitchCardPrice}>
                      ${pitch.pricePerHour}
                      <Text style={styles.pitchCardPriceSub}>/s</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

// ── Icons ──────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke={Colors.textPrimary} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Eslatma: Kodda "styles" obyekti berilmagan, uni o'z loyihangizga qarab StyleSheet.create orqali e'lon qilib oling.
function LayerIcon({ active }: { active: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5z"
        stroke={active ? Colors.neon : Colors.textPrimary}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 17l10 5 10-5"
        stroke={active ? Colors.neon : Colors.textPrimary}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12l10 5 10-5"
        stroke={active ? Colors.neon : Colors.textPrimary}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1a0d' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
];

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8,
  },
  topBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(13,13,13,0.85)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  topBtnActive: {
    backgroundColor: Colors.neon + '20',
    borderColor: Colors.neon + '60',
  },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(13,13,13,0.85)',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 25, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.neon,
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  liveText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },

  markerWrap: { alignItems: 'center' },
  markerLarge: {
    backgroundColor: Colors.neon,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 8,
  },
  markerLargeText: { fontSize: 12, fontWeight: '800', color: Colors.neonDark },
  markerDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.neon + '25',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.neon + '60',
  },
  markerDotInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.neon,
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 4, elevation: 4,
  },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 100,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  handleWrap: {
    paddingVertical: 14, alignItems: 'center',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  foundBadge: {
    backgroundColor: Colors.surface, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 10,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  foundText: { fontSize: 11, fontWeight: '700', color: Colors.neon, letterSpacing: 0.5 },
  handleHint: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  selectedCard: {
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 18, overflow: 'hidden', height: 110,
    backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.neon + '40',
  },
  selectedCardContent: {
    flex: 1, flexDirection: 'row',
    alignItems: 'flex-end', padding: 14, gap: 10,
  },
  selectedName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  selectedMeta: { flexDirection: 'row', alignItems: 'center' },
  selectedMetaText: { fontSize: 11, color: '#aaa' },
  selectedTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tagActive: {
    backgroundColor: Colors.neon + '20',
    borderWidth: 0.5, borderColor: Colors.neon + '40',
  },
  tagText: { fontSize: 9, fontWeight: '700', color: '#ccc', letterSpacing: 0.3 },
  selectedRight: { alignItems: 'flex-end' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  selectedPrice: { fontSize: 20, fontWeight: '800', color: Colors.neon },
  selectedPriceSub: { fontSize: 10, color: Colors.textMuted },

  listContent: { paddingHorizontal: 16, gap: 10 },
  pitchCard: {
    width: 155, borderRadius: 16, overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  pitchCardActive: {
    borderColor: Colors.neon,
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  pitchCardImg: { width: '100%', height: 80 },
  pitchCardBody: { padding: 10, gap: 3 },
  pitchCardName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  pitchCardMeta: { fontSize: 10, color: Colors.textMuted },
  pitchCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 4,
  },
  activeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  activeTagText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  pitchCardPrice: { fontSize: 13, fontWeight: '800', color: Colors.neon },
  pitchCardPriceSub: { fontSize: 9, color: Colors.textMuted, fontWeight: '400' },
});