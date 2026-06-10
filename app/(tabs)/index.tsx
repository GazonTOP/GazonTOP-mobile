import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, FlatList, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';  
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { PITCHES, FILTERS } from '../../src/constants/mockData';
import { Pitch, FilterType } from '../../src/types';
import { BellIcon, SearchIcon, FilterIcon, StarIcon, PinIcon } from '../../src/components/ui/Icons';
import * as Location from 'expo-location';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 40;

const weatherIcons: { [key: string]: string } = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Smoke: '🌫️',
  Haze: '🌫️',
};

const WEATHER_API_KEY = "d0f8cbe7b9d02a9c16cae97b713967fb";

const PROMOS = [
  { id: '1', title: 'Dushanba chegirma!', desc: 'Har dushanba 20% chegirma', color: ['#1a3a1a', '#0d2a0d'] as const, emoji: '🏷️' },
  { id: '2', title: 'Do\'stingni taklif qil', desc: 'Har bir do\'st uchun 50k bonus', color: ['#1a1a3a', '#0d0d2a'] as const, emoji: '🎁' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All Venues');
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderRef = useRef<FlatList>(null);

  const LIVE_GAMES = [
    { id: '1', sport: '⚽', sportName: t('live.football'), venue: t('live.venue'), players: '8/10', time: "43'", color: '#1a3a1a', accent: '#4CAF50' },
    { id: '2', sport: '🎾', sportName: t('live.tennis'), venue: t('live.venue2'), players: '2/2', time: '2-1', color: '#1a1a3a', accent: '#2196F3' },
    { id: '3', sport: '🏀', sportName: t('live.basketball'), venue: t('live.venue3'), players: '6/10', time: '3Q', color: '#3a1a0d', accent: '#FF5722' },
  ];

  const SPORT_TYPES = [
    { id: '1', emoji: '⚽', name: t('sports.football'), count: 12, available: true },
    { id: '2', emoji: '🎾', name: t('sports.tennis'), count: 4, available: true },
    { id: '3', emoji: '🏀', name: t('sports.basketball'), count: 3, available: false, soon: true },
    { id: '4', emoji: '🏐', name: t('sports.volleyball'), count: 2, available: false, soon: true },
    { id: '5', emoji: '🥅', name: t('sports.futsal'), count: 6, available: true },
    { id: '6', emoji: '🏓', name: t('sports.paddle'), count: 2, available: true, isNew: true },
  ];

  const filterLabels: Record<FilterType, string> = {
    'All Venues': t('filters.allVenues'),
    '5-a-side': t('filters.fiveAside'),
    '7-a-side': t('filters.sevenAside'),
    'Indoor': t('filters.indoor'),
    'Tennis': t('filters.tennis'),
  };

  const onSliderScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
    setSliderIndex(idx);
  };

  const [locationName, setLocationName] = useState<string>('Yuklanmoqda...');
  const [loading, setLoading] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<string>('--°C');
  const [weatherEmoji, setWeatherEmoji] = useState<string>('☀️');

  useEffect(() => {
    async function fetchLocationAndWeather() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName("Toshkent, UZ");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const city = place.city || place.region || place.subregion || "Noma'lum";
          const country = place.isoCountryCode || "UZ";
          setLocationName(`${city}, ${country}`);
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
        
        const response = await fetch(weatherUrl);
        const weatherData = await response.json();

        if (weatherData && weatherData.main && weatherData.weather) {
          const temp = Math.round(weatherData.main.temp);
          setTemperature(`${temp}°C`);

          const mainCondition = weatherData.weather[0].main;
          setWeatherEmoji(weatherIcons[mainCondition] || '☀️');
        }
      } catch (error) {
        console.log("Xatolik yuz berdi:", error);
        setLocationName("Toshkent, UZ");
      } finally {
        setLoading(false);
      }
    }

    fetchLocationAndWeather();
  }, []);

  return (
 <SafeAreaView style={styles.safe}>

      {/* ── FIXED TOP ── */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.locLabel}>{t('common.location')}</Text>
            <View style={styles.locRow}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} style={{ marginRight: 5 }} />
              ) : (
                <Text style={styles.locName}>{locationName}</Text>
              )}
              <Text style={styles.locArrow}> ▾</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.weatherChip}>
              <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
              <Text style={styles.weatherTemp}>{temperature}</Text>
            </View>
            
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/login' as any)}>
              <BellIcon color={Colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SearchIcon color={Colors.textMuted} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <FilterIcon color={Colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f as FilterType)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {filterLabels[f as FilterType]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Slider */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.featured')}</Text>
          <View style={styles.dotsRow}>
            {PITCHES.map((_, i) => (
              <View key={i} style={[styles.dot, i === sliderIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <FlatList
          ref={sliderRef}
          data={PITCHES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          onScroll={onSliderScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeaturedCard pitch={item} width={CARD_W} />}
        />

        {/* Promo */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Haftalik aksiya</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}>
          {PROMOS.map((p) => <PromoCard key={p.id} promo={p} />)}
        </ScrollView>

        {/* Live */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.liveLeft}>
            <View style={styles.liveDot} />
            <Text style={styles.sectionTitle}>{t('home.liveNow')}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}>
          {LIVE_GAMES.map((g) => (
            <LiveCard key={g.id} game={g}
              playersLabel={t('common.players')}
              timeLabel={t('common.time')}
              liveLabel={t('common.live')}
            />
          ))}
        </ScrollView>

        {/* Sport types */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>{t('home.sportVenues')}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDesc}>{t('home.sportVenuesDesc')}</Text>

        <View style={styles.sportGrid}>
          {SPORT_TYPES.map((s) => (
            <SportCard key={s.id} sport={s}
              newLabel={t('common.new')}
              soonLabel={t('common.soon')}
              venuesLabel={t('common.venues')}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Featured Card (rasm bilan) ─────────────────────────
function FeaturedCard({ pitch, width }: { pitch: Pitch; width: number }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity 
      style={[styles.featCard, { width }]} 
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: '/pitch/[id]', params: { id: pitch.id } } as any)}
    >
      <Image
        source={{ uri: pitch.imageUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFillObject}
      />

      {pitch.instantBook && (
        <View style={styles.instantBadge}>
          <Text style={styles.instantText}>{t('common.instantBook')}</Text>
        </View>
      )}
      <View style={styles.ratingBadge}>
        <StarIcon size={11} color={Colors.neon} />
        <Text style={styles.ratingText}> {pitch.rating}</Text>
      </View>

      <View style={styles.featBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.featName}>{pitch.name}</Text>
          <View style={styles.featMetaRow}>
            <PinIcon size={11} color="#aaa" />
            <Text style={styles.featMeta}> {pitch.distance}</Text>
            <Text style={styles.featMetaDot}> · </Text>
            <Text style={styles.featMeta}>👤 {pitch.format}</Text>
          </View>
          <View style={styles.featTags}>
            <View style={styles.featTag}>
              <Text style={styles.featTagText}>{pitch.surface}</Text>
            </View>
            <View style={styles.featTag}>
              <Text style={styles.featTagText}>
                {pitch.type === 'outdoor' ? t('common.outdoor') : t('common.indoor')}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.priceLabel}>{t('common.price')}</Text>
          <Text style={styles.featPrice}>${pitch.pricePerHour}</Text>
          <Text style={styles.featPriceSub}>{t('common.perHour')}</Text>
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>{t('common.book')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Promo Card ─────────────────────────────────────────
function PromoCard({ promo }: { promo: typeof PROMOS[0] }) {
  return (
    <TouchableOpacity style={styles.promoCard} activeOpacity={0.85}>
      <LinearGradient colors={promo.color} style={StyleSheet.absoluteFillObject} />
      <Text style={styles.promoEmoji}>{promo.emoji}</Text>
      <Text style={styles.promoTitle}>{promo.title}</Text>
      <Text style={styles.promoDesc}>{promo.desc}</Text>
      <View style={styles.promoBtn}>
        <Text style={styles.promoBtnText}>Ko'rish →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Live Card ──────────────────────────────────────────
function LiveCard({ game, playersLabel, timeLabel, liveLabel }: {
  game: { id: string; sport: string; sportName: string; venue: string; players: string; time: string; color: string; accent: string };
  playersLabel: string; timeLabel: string; liveLabel: string;
}) {
  return (
    <TouchableOpacity style={styles.liveCard} activeOpacity={0.85}>
      <LinearGradient colors={[game.color, '#0D0D0D']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.liveTop}>
        <Text style={styles.liveEmoji}>{game.sport}</Text>
        <View style={[styles.livePill, { backgroundColor: game.accent + '33', borderColor: game.accent + '66' }]}>
          <View style={[styles.livePillDot, { backgroundColor: game.accent }]} />
          <Text style={[styles.livePillText, { color: game.accent }]}>{liveLabel}</Text>
        </View>
      </View>
      <Text style={styles.liveSport}>{game.sportName}</Text>
      <Text style={styles.liveVenue}>📍 {game.venue}</Text>
      <View style={styles.liveBottom}>
        <View style={styles.liveStatBox}>
          <Text style={styles.liveStatVal}>{game.players}</Text>
          <Text style={styles.liveStatLabel}>{playersLabel}</Text>
        </View>
        <View style={[styles.liveStatBox, { borderLeftWidth: 0.5, borderLeftColor: Colors.border }]}>
          <Text style={styles.liveStatVal}>{game.time}</Text>
          <Text style={styles.liveStatLabel}>{timeLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Sport Card ─────────────────────────────────────────
function SportCard({ sport, newLabel, soonLabel, venuesLabel }: {
  sport: { id: string; emoji: string; name: string; count: number; available: boolean; soon?: boolean; isNew?: boolean };
  newLabel: string; soonLabel: string; venuesLabel: string;
}) {
  return (
    <TouchableOpacity style={[styles.sportCard, !sport.available && styles.sportCardDim]} activeOpacity={sport.available ? 0.8 : 0.6}>
      {sport.isNew && (
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>{newLabel}</Text>
        </View>
      )}
      {sport.soon && (
        <View style={[styles.sportBadge, styles.sportBadgeSoon]}>
          <Text style={[styles.sportBadgeText, { color: Colors.textMuted }]}>{soonLabel}</Text>
        </View>
      )}
      <Text style={styles.sportEmoji}>{sport.emoji}</Text>
      <Text style={styles.sportName}>{sport.name}</Text>
      {sport.available
        ? <Text style={styles.sportCount}>{sport.count} {venuesLabel}</Text>
        : <Text style={[styles.sportCount, { color: Colors.textMuted }]}>—</Text>
      }
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  fixedTop: {
    backgroundColor: Colors.surface, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 5, 
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 12,
  },
  locLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  locName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  locArrow: { fontSize: 16, color: Colors.textPrimary, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weatherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  weatherEmoji: { fontSize: 14 },
  weatherTemp: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },

  searchRow: { flexDirection: 'row', marginHorizontal: 20, gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  filterBtn: {
    width: 50, backgroundColor: Colors.surface, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },

  filtersContent: { paddingHorizontal: 20, gap: 8, paddingTop: 14, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 25,
    borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.neonDark, fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  sectionDesc: { fontSize: 13, color: Colors.textMuted, paddingHorizontal: 20, marginTop: -8, marginBottom: 14 },
  seeAll: { fontSize: 13, color: Colors.neon, fontWeight: '700' },
  liveLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' },
  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 16, backgroundColor: Colors.neon },

  // Featured
  featCard: {
    height: 240, borderRadius: 22, overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  instantBadge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: Colors.neon, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 10,
  },
  instantText: { fontSize: 10, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.5 },
  ratingBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  ratingText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700' },
  featBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 16, paddingTop: 30, gap: 12,
  },
  featName: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  featMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featMeta: { fontSize: 12, color: '#ccc' },
  featMetaDot: { color: '#888', fontSize: 12 },
  featTags: { flexDirection: 'row', gap: 6 },
  featTag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  featTagText: { fontSize: 10, color: '#ddd', fontWeight: '500' },
  priceLabel: { fontSize: 9, color: '#aaa', letterSpacing: 1, fontWeight: '700' },
  featPrice: { fontSize: 26, fontWeight: '800', color: Colors.neon },
  featPriceSub: { fontSize: 11, color: '#aaa' },
  bookBtn: { marginTop: 4, backgroundColor: Colors.neon, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
  bookBtnText: { fontSize: 12, fontWeight: '800', color: Colors.neonDark },

  // Promo
  promoCard: {
    width: 200, borderRadius: 18, overflow: 'hidden',
    padding: 16, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border, gap: 4,
  },
  promoEmoji: { fontSize: 28, marginBottom: 4 },
  promoTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  promoDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 16 },
  promoBtn: {
    marginTop: 10, backgroundColor: Colors.neon + '20',
    borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12,
    alignSelf: 'flex-start', borderWidth: 0.5, borderColor: Colors.neon + '40',
  },
  promoBtnText: { fontSize: 11, fontWeight: '700', color: Colors.neon },

  // Live
  liveCard: {
    width: 160, borderRadius: 18, overflow: 'hidden',
    padding: 14, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  liveTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  liveEmoji: { fontSize: 28 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 0.5 },
  livePillDot: { width: 5, height: 5, borderRadius: 3 },
  livePillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  liveSport: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 3 },
  liveVenue: { fontSize: 11, color: Colors.textMuted, marginBottom: 12 },
  liveBottom: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden' },
  liveStatBox: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  liveStatVal: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  liveStatLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 1 },

  // Sport grid
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  sportCard: {
    width: (SCREEN_W - 52) / 3, backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.border, gap: 4,
  },
  sportCardDim: { opacity: 0.55 },
  sportEmoji: { fontSize: 32, marginBottom: 4 },
  sportName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  sportCount: { fontSize: 10, color: Colors.neon, fontWeight: '600' },
  sportBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.neon, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  sportBadgeSoon: { backgroundColor: Colors.surfaceHigh, borderWidth: 0.5, borderColor: Colors.border },
  sportBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.3 },
});