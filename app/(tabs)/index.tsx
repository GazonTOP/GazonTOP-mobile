import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, FlatList, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent, Image, ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../../src/constants/colors';
import { PITCHES, FILTERS } from '../../src/constants/mockData';
import { Pitch, FilterType } from '../../src/types';
import { BellIcon, SearchIcon, FilterIcon, StarIcon, PinIcon } from '../../src/components/ui/Icons';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 40;

const WEATHER_API_KEY = 'd0f8cbe7b9d02a9c16cae97b713967fb';
const weatherIcons: Record<string, string> = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
  Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️',
  Mist: '🌫️', Smoke: '🌫️', Haze: '🌫️',
};

function GazonTopLogo({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 8 C30 8 14 24 14 44 C14 64 50 92 50 92 C50 92 86 64 86 44 C86 24 70 8 50 8 Z"
        stroke={Colors.neon} strokeWidth="5" fill="none"
      />
      <Line x1="50" y1="14" x2="50" y2="78" stroke={Colors.neon} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="50" cy="44" r="16" stroke={Colors.neon} strokeWidth="4" fill="none" />
      <Circle cx="50" cy="44" r="4" fill={Colors.neon} />
    </Svg>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All Venues');
  const [searchText, setSearchText] = useState('');
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUserScrolling = useRef(false);

  const [locationName, setLocationName] = useState('Yuklanmoqda...');
  const [loading, setLoading] = useState(true);
  const [temperature, setTemperature] = useState('--°C');
  const [weatherEmoji, setWeatherEmoji] = useState('☀️');

  useEffect(() => {
    async function fetchLocationAndWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocationName('Toshkent, UZ'); setLoading(false); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const p = geocode[0];
          setLocationName(`${p.city || p.region || "Noma'lum"}, ${p.isoCountryCode || 'UZ'}`);
        }
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`);
        const data = await res.json();
        if (data?.main) {
          setTemperature(`${Math.round(data.main.temp)}°C`);
          setWeatherEmoji(weatherIcons[data.weather[0].main] ?? '☀️');
        }
      } catch { setLocationName('Toshkent, UZ'); }
      finally { setLoading(false); }
    }
    fetchLocationAndWeather();
  }, []);

  const LIVE_GAMES = [
    { id: '1', sport: '⚽', sportName: t('live.football'), venue: t('live.venue'), players: '8/10', time: "43'", color: '#4CAF50', bgColor: '#0a1f0a' },
    { id: '2', sport: '🎾', sportName: t('live.tennis'), venue: t('live.venue2'), players: '2/2', time: '2-1', color: '#2196F3', bgColor: '#080d1f' },
    { id: '3', sport: '🏀', sportName: t('live.basketball'), venue: t('live.venue3'), players: '6/10', time: '3Q', color: '#FF6B35', bgColor: '#1f0d08' },
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

  const filteredPitches = PITCHES.filter((p) => {
    const s = searchText.toLowerCase();
    const matchSearch = !s || p.name.toLowerCase().includes(s) || p.address.toLowerCase().includes(s) || p.surface.toLowerCase().includes(s);
    const matchFilter =
      activeFilter === 'All Venues' ||
      (activeFilter === '5-a-side' && p.format === '5v5') ||
      (activeFilter === '7-a-side' && p.format === '7v7') ||
      (activeFilter === 'Indoor' && p.type === 'indoor') ||
      (activeFilter === 'Tennis' && p.image === '🎾');
    return matchSearch && matchFilter;
  });

  const sliderData = activeFilter === 'All Venues' ? PITCHES : filteredPitches;
  const isSearching = searchText.length > 0;

  const onSliderScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSliderIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12)));
  };

  // ── Auto-scroll: har 3.5 soniyada keyingi card ga o'tadi ──
  useEffect(() => {
    if (sliderData.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        if (isUserScrolling.current) return;
        setSliderIndex((prev) => {
          const next = (prev + 1) % sliderData.length;
          sliderRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, 3500);
    };

    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [sliderData.length]);

  // Foydalanuvchi scroll qilsa, avtomatik scrollni 4 soniyaga to'xtatadi
  const onSliderScrollBegin = () => {
    isUserScrolling.current = true;
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
  };

  const onSliderScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
    setSliderIndex(idx);
    isUserScrolling.current = false;
    // 4 soniya kutib qayta boshlaydi
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      if (isUserScrolling.current) return;
      setSliderIndex((prev) => {
        const next = (prev + 1) % sliderData.length;
        sliderRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── FIXED TOP ── */}
      <View style={styles.fixedTop}>
        <View style={styles.logoRow}>
          <View style={styles.logoLeft}>
            <GazonTopLogo size={42} />
            <View>
              <View style={styles.logoTextRow}>
                <Text style={styles.logoTextWhite}>Gazon</Text>
                <Text style={styles.logoTextGreen}> Top</Text>
              </View>
              <View style={styles.locRow}>
                {loading
                  ? <ActivityIndicator size="small" color={Colors.textMuted} />
                  : <Text style={styles.locName}>📍 {locationName}</Text>
                }
              </View>
            </View>
          </View>
          <View style={styles.logoRight}>
            <View style={styles.weatherChip}>
              <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
              <Text style={styles.weatherTemp}>{temperature}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Bildirishnomalar', 'Hozircha yangi bildirishnoma yo\'q 🔔')}>
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
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <FilterIcon color={Colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SCROLL ── */}
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

        {isSearching ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultLabel}>
              "{searchText}" — {filteredPitches.length} ta natija
            </Text>
            {filteredPitches.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>Natija topilmadi</Text>
                <Text style={styles.emptyDesc}>Boshqa kalit so'z bilan qidiring</Text>
              </View>
            ) : (
              filteredPitches.map((p) => <SearchResultCard key={p.id} pitch={p} />)
            )}
          </View>
        ) : (
          <>
            {/* Featured */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.featured')}</Text>
              <View style={styles.dotsRow}>
                {sliderData.map((_, i) => (
                  <View key={i} style={[styles.dot, i === sliderIndex && styles.dotActive]} />
                ))}
              </View>
            </View>

            {sliderData.length > 0 ? (
              <FlatList
                ref={sliderRef}
                data={sliderData}
                horizontal pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + 12}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                onScroll={onSliderScroll}
                scrollEventThrottle={16}
                onScrollBeginDrag={onSliderScrollBegin}
                onMomentumScrollEnd={onSliderScrollEnd}
                getItemLayout={(_, index) => ({
                  length: CARD_W + 12,
                  offset: (CARD_W + 12) * index,
                  index,
                })}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FeaturedCard pitch={item} width={CARD_W} />}
              />
            ) : (
              <View style={[styles.emptyBox, { marginHorizontal: 20 }]}>
                <Text style={styles.emptyEmoji}>🏟️</Text>
                <Text style={styles.emptyTitle}>Bu filtrada maydon yo'q</Text>
              </View>
            )}

            {/* ── LIVE NOW ── */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <View style={styles.liveLeft}>
                <View style={styles.livePulse}>
                  <View style={styles.livePulseInner} />
                </View>
                <Text style={styles.sectionTitle}>{t('home.liveNow')}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 4 }}>
              {LIVE_GAMES.map((g) => (
                <LiveCard key={g.id} game={g}
                  playersLabel={t('common.players')}
                  timeLabel={t('common.time')}
                  liveLabel={t('common.live')}
                />
              ))}
            </ScrollView>

            {/* ── SPORT TYPES ── */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
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
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Featured Card ──────────────────────────────────────
function FeaturedCard({ pitch, width }: { pitch: Pitch; width: number }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.featCard, { width }]}
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: '/pitch/[id]', params: { id: pitch.id } } as any)}
    >
      <Image source={{ uri: pitch.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFillObject} />
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
            <PinIcon size={11} color="#bbb" />
            <Text style={styles.featMeta}> {pitch.distance}</Text>
            <Text style={styles.featMetaDot}> · </Text>
            <Text style={styles.featMeta}>👤 {pitch.format}</Text>
          </View>
          <View style={styles.featTags}>
            <View style={styles.featTag}><Text style={styles.featTagText}>{pitch.surface}</Text></View>
            <View style={styles.featTag}>
              <Text style={styles.featTagText}>
                {pitch.type === 'outdoor' ? t('common.outdoor') : t('common.indoor')}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={styles.priceLabel}>{t('common.price')}</Text>
          <Text style={styles.featPrice}>${pitch.pricePerHour}</Text>
          <Text style={styles.featPriceSub}>{t('common.perHour')}</Text>
          <TouchableOpacity style={styles.bookBtn}
            onPress={() => router.push({ pathname: '/pitch/[id]', params: { id: pitch.id } } as any)}>
            <Text style={styles.bookBtnText}>{t('common.book')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Search Result Card ─────────────────────────────────
function SearchResultCard({ pitch }: { pitch: Pitch }) {
  return (
    <TouchableOpacity
      style={styles.searchCard}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/pitch/[id]', params: { id: pitch.id } } as any)}
    >
      <Image source={{ uri: pitch.imageUrl }} style={styles.searchCardImg} resizeMode="cover" />
      <View style={styles.searchCardBody}>
        <View style={styles.searchCardTop}>
          <Text style={styles.searchCardName} numberOfLines={1}>{pitch.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StarIcon size={10} color={Colors.neon} />
            <Text style={styles.searchRatingText}> {pitch.rating}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PinIcon size={11} color={Colors.textMuted} />
          <Text style={styles.searchMetaText}> {pitch.distance} · {pitch.address}</Text>
        </View>
        <View style={styles.searchCardBottom}>
          <View style={styles.searchTags}>
            <View style={styles.searchTag}><Text style={styles.searchTagText}>{pitch.format}</Text></View>
            <View style={[styles.searchTag, pitch.isActive ? styles.searchTagActive : {}]}>
              <Text style={[styles.searchTagText, pitch.isActive ? { color: Colors.neon } : {}]}>
                {pitch.isActive ? '● FAOL' : '● YOPIQ'}
              </Text>
            </View>
          </View>
          <Text style={styles.searchPrice}>${pitch.pricePerHour}<Text style={styles.searchPriceSub}>/s</Text></Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Live Card (Yangi dizayn) ───────────────────────────
function LiveCard({ game, playersLabel, timeLabel, liveLabel }: {
  game: {
    id: string; sport: string; sportName: string; venue: string;
    players: string; time: string; color: string; bgColor: string;
  };
  playersLabel: string; timeLabel: string; liveLabel: string;
}) {
  return (
    <TouchableOpacity style={[styles.liveCard, { backgroundColor: game.bgColor }]} activeOpacity={0.85}>
      {/* Yuqori chiziq — rang aksenti */}
      <View style={[styles.liveAccentBar, { backgroundColor: game.color }]} />

      {/* Header: emoji + live badge */}
      <View style={styles.liveHeader}>
        <View style={[styles.liveEmojiWrap, { borderColor: game.color + '40', backgroundColor: game.color + '18' }]}>
          <Text style={styles.liveEmoji}>{game.sport}</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: game.color + '22', borderColor: game.color + '55' }]}>
          <View style={[styles.liveBadgeDot, { backgroundColor: game.color }]} />
          <Text style={[styles.liveBadgeText, { color: game.color }]}>{liveLabel}</Text>
        </View>
      </View>

      {/* Sport nomi */}
      <Text style={styles.liveSportName}>{game.sportName}</Text>

      {/* Manzil */}
      <View style={styles.liveVenueRow}>
        <Text style={styles.liveVenuePin}>📍</Text>
        <Text style={styles.liveVenueName} numberOfLines={1}>{game.venue}</Text>
      </View>

      {/* Divider */}
      <View style={[styles.liveDivider, { backgroundColor: game.color + '25' }]} />

      {/* Statistika */}
      <View style={styles.liveStatsRow}>
        <View style={styles.liveStatBlock}>
          <Text style={[styles.liveStatValue, { color: game.color }]}>{game.players}</Text>
          <Text style={styles.liveStatKey}>{playersLabel}</Text>
        </View>
        <View style={[styles.liveStatLine, { backgroundColor: game.color + '30' }]} />
        <View style={styles.liveStatBlock}>
          <Text style={[styles.liveStatValue, { color: game.color }]}>{game.time}</Text>
          <Text style={styles.liveStatKey}>{timeLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Sport Card (Yangi dizayn) ─────────────────────────
const SPORT_ACCENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  '⚽': { bg: '#0e2010', border: '#2a5c30', text: '#4CAF50' },
  '🎾': { bg: '#0a1020', border: '#1e3a5a', text: '#42A5F5' },
  '🏀': { bg: '#1f0e06', border: '#5a2a10', text: '#FF6B35' },
  '🏐': { bg: '#0f0f20', border: '#2a2a5a', text: '#9C6FD6' },
  '🥅': { bg: '#0e1a10', border: '#1e4025', text: '#66BB6A' },
  '🏓': { bg: '#1a100a', border: '#4a2510', text: '#FFA726' },
};

function SportCard({ sport, newLabel, soonLabel, venuesLabel }: {
  sport: { id: string; emoji: string; name: string; count: number; available: boolean; soon?: boolean; isNew?: boolean };
  newLabel: string; soonLabel: string; venuesLabel: string;
}) {
  const accent = SPORT_ACCENT_COLORS[sport.emoji] ?? { bg: '#111', border: '#333', text: Colors.neon };

  return (
    <TouchableOpacity
      style={[
        styles.sportCard,
        sport.available
          ? { backgroundColor: accent.bg, borderColor: accent.border }
          : { backgroundColor: '#0e0e0e', borderColor: '#1f1f1f' },
        !sport.available && styles.sportCardDim,
      ]}
      activeOpacity={sport.available ? 0.78 : 0.55}
    >
      {/* Badge: NEW yoki SOON */}
      {sport.isNew && (
        <View style={[styles.sportBadge, { backgroundColor: Colors.neon }]}>
          <Text style={styles.sportBadgeText}>{newLabel}</Text>
        </View>
      )}
      {sport.soon && (
        <View style={[styles.sportBadge, styles.sportBadgeSoon]}>
          <Text style={[styles.sportBadgeText, { color: Colors.textMuted }]}>{soonLabel}</Text>
        </View>
      )}

      {/* Emoji doira */}
      <View style={[
        styles.sportIconCircle,
        sport.available
          ? { backgroundColor: accent.text + '18', borderColor: accent.text + '35' }
          : { backgroundColor: '#181818', borderColor: '#2a2a2a' },
      ]}>
        <Text style={styles.sportEmoji}>{sport.emoji}</Text>
      </View>

      {/* Sport nomi */}
      <Text style={[styles.sportName, !sport.available && { color: Colors.textMuted }]}>{sport.name}</Text>

      {/* Maydonlar soni yoki tez kunda */}
      {sport.available ? (
        <View style={[styles.sportCountPill, { backgroundColor: accent.text + '18', borderColor: accent.text + '40' }]}>
          <Text style={[styles.sportCountNum, { color: accent.text }]}>{sport.count}</Text>
          <Text style={[styles.sportCountLabel, { color: accent.text + 'cc' }]}> {venuesLabel}</Text>
        </View>
      ) : (
        <View style={styles.sportSoonPill}>
          <Text style={styles.sportSoonLabel}>Tez kunda</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  fixedTop: {
    backgroundColor: '#111111',
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 10, paddingBottom: 14,
  },
  logoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoTextRow: { flexDirection: 'row', alignItems: 'center' },
  logoTextWhite: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  logoTextGreen: { fontSize: 22, fontWeight: '900', color: Colors.neon, letterSpacing: -0.5 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  locName: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  logoRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weatherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  weatherEmoji: { fontSize: 13 },
  weatherTemp: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  iconBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },

  searchRow: { flexDirection: 'row', marginHorizontal: 20, gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: Colors.textMuted, fontWeight: '700' },
  filterBtn: {
    width: 48, backgroundColor: Colors.surface, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },

  filtersContent: { paddingHorizontal: 20, gap: 8, paddingTop: 14, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25,
    borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.neon, borderColor: Colors.neon },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.neonDark, fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  sectionDesc: { fontSize: 13, color: Colors.textMuted, paddingHorizontal: 20, marginTop: -8, marginBottom: 14 },
  seeAll: { fontSize: 12, color: Colors.neon, fontWeight: '700' },

  liveLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Yangi live pulse animatsiyasiz sodda versiya:
  livePulse: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FF444430',
    alignItems: 'center', justifyContent: 'center',
  },
  livePulseInner: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#FF4444',
  },

  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 16, backgroundColor: Colors.neon },

  // Featured
  featCard: { height: 240, borderRadius: 22, overflow: 'hidden', backgroundColor: Colors.surface },
  instantBadge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: Colors.neon, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  instantText: { fontSize: 10, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.5 },
  ratingBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center',
  },
  ratingText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700' },
  featBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', padding: 16, paddingTop: 28, gap: 12,
  },
  featName: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  featMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featMeta: { fontSize: 12, color: '#ccc' },
  featMetaDot: { color: '#777', fontSize: 12 },
  featTags: { flexDirection: 'row', gap: 6 },
  featTag: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  featTagText: { fontSize: 10, color: '#ddd', fontWeight: '500' },
  priceLabel: { fontSize: 9, color: '#aaa', letterSpacing: 1, fontWeight: '700' },
  featPrice: { fontSize: 24, fontWeight: '800', color: Colors.neon },
  featPriceSub: { fontSize: 11, color: '#aaa' },
  bookBtn: { marginTop: 4, backgroundColor: Colors.neon, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11 },
  bookBtnText: { fontSize: 12, fontWeight: '800', color: Colors.neonDark },

  // Search
  searchResults: { paddingHorizontal: 20, paddingTop: 8 },
  searchResultLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginBottom: 14 },
  searchCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 18, overflow: 'hidden', marginBottom: 12,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  searchCardImg: { width: 88, height: 88 },
  searchCardBody: { flex: 1, padding: 12, gap: 4 },
  searchCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  searchCardName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  searchRatingText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  searchMetaText: { fontSize: 11, color: Colors.textMuted },
  searchCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  searchTags: { flexDirection: 'row', gap: 4 },
  searchTag: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: Colors.surfaceHigh, borderWidth: 0.5, borderColor: Colors.border,
  },
  searchTagActive: { backgroundColor: Colors.neon + '18', borderColor: Colors.neon + '40' },
  searchTagText: { fontSize: 9, fontWeight: '700', color: Colors.textMuted },
  searchPrice: { fontSize: 13, fontWeight: '800', color: Colors.neon },
  searchPriceSub: { fontSize: 10, color: Colors.textMuted, fontWeight: '400' },

  // Empty
  emptyBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 48, backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border, marginBottom: 20,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: Colors.textMuted },

  // ── Live Card (yangi) ──────────────────────────────
  liveCard: {
    width: 164,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#1e1e1e',
    gap: 0,
  },
  liveAccentBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  liveEmojiWrap: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  liveEmoji: { fontSize: 24 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 0.5,
  },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 3 },
  liveBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  liveSportName: {
    fontSize: 15, fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  liveVenueRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10 },
  liveVenuePin: { fontSize: 10 },
  liveVenueName: { fontSize: 10, color: Colors.textMuted, flex: 1 },
  liveDivider: { height: 0.5, marginBottom: 10 },
  liveStatsRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  liveStatBlock: { flex: 1, alignItems: 'center' },
  liveStatValue: { fontSize: 17, fontWeight: '800' },
  liveStatKey: { fontSize: 9, color: Colors.textMuted, marginTop: 2, fontWeight: '600', letterSpacing: 0.3 },
  liveStatLine: { width: 0.5, height: 28, marginHorizontal: 4 },

  // ── Sport Card (yangi) ─────────────────────────────
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  sportCard: {
    width: (SCREEN_W - 52) / 3,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
    position: 'relative',
  },
  sportCardDim: { opacity: 0.45 },

  sportIconCircle: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
  sportEmoji: { fontSize: 26 },
  sportName: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  sportCountPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1,
  },
  sportCountNum: { fontSize: 12, fontWeight: '800' },
  sportCountLabel: { fontSize: 9, fontWeight: '600' },

  sportSoonPill: {
    backgroundColor: '#181818',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  sportSoonLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },

  sportBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
    zIndex: 1,
  },
  sportBadgeSoon: { backgroundColor: Colors.surfaceHigh, borderWidth: 0.5, borderColor: Colors.border },
  sportBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.neonDark, letterSpacing: 0.3 },
});