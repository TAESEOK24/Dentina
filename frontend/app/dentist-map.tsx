import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

type Dentist = {
  id: string;
  name: string;
  categoryName: string;
  phone: string;
  address: string;
  placeUrl: string;
  distance: number | null;
  latitude: number;
  longitude: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

const getApiOrigin = () => {
  const manifest = Constants.manifest as { debuggerHost?: string } | null;
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  const manifest2 = Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null;
  const hostUri = expoConfig?.hostUri || manifest2?.extra?.expoClient?.hostUri || manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];

  return `http://${host || '192.168.0.98'}:3000`;
};

const API_ORIGIN = getApiOrigin();

function formatDistance(distance: number | null) {
  if (distance === null) {
    return '';
  }

  return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
}

export default function DentistMapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [searchQuery, setSearchQuery] = useState('치과');
  const [activeQuery, setActiveQuery] = useState('치과');
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [mapFocus, setMapFocus] = useState<'me' | 'results'>('me');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDentists = useCallback(async (nextQuery = searchQuery, nextLocation?: UserLocation) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let currentLocation = nextLocation;

      if (!currentLocation) {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== 'granted') {
          setErrorMessage('위치 권한이 필요합니다. 권한을 허용한 뒤 다시 시도해 주세요.');
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        currentLocation = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
      }

      const dentistsResponse = await fetch(
        `${API_ORIGIN}/api/dentists?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=3000&query=${encodeURIComponent(nextQuery)}`,
      );
      const dentistsPayload = await dentistsResponse.json();

      if (!dentistsResponse.ok) {
        throw new Error(dentistsPayload?.detail || dentistsPayload?.error || '주변 치과를 불러오지 못했습니다.');
      }

      const nextDentists = Array.isArray(dentistsPayload.dentists) ? dentistsPayload.dentists : [];
      setLocation(currentLocation);
      setDentists(nextDentists);
      setSelectedDentist(nextDentists[0] || null);
      setActiveQuery(nextQuery);
      setMapFocus('me');
    } catch (error) {
      const message = error instanceof Error ? error.message : '주변 치과 검색 중 문제가 발생했습니다.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadDentists('치과');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapUrl = useMemo(() => {
    if (!location) {
      return '';
    }

    return `${API_ORIGIN}/map/dentists?lat=${location.latitude}&lng=${location.longitude}&radius=3000&query=${encodeURIComponent(activeQuery)}&focus=${mapFocus}`;
  }, [activeQuery, location, mapFocus]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);

      if (payload.type === 'dentist') {
        setSelectedDentist(payload.dentist);
      }

      if (payload.type === 'mapClick' && isPickingLocation) {
        const nextLocation = {
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
        };

        setIsPickingLocation(false);
        loadDentists(activeQuery, nextLocation);
      }
    } catch {
      // Ignore non-map messages.
    }
  };

  const openPlace = (placeUrl?: string) => {
    if (placeUrl) {
      Linking.openURL(placeUrl);
    }
  };

  const callDentist = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`);
    }
  };

  const selectDentist = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'selectDentist',
        dentistId: dentist.id,
      }),
    );
  };

  const handleSearch = () => {
    loadDentists(searchQuery.trim() || '치과', location || undefined);
  };

  const handleMyLocation = () => {
    setIsPickingLocation(false);
    loadDentists(activeQuery);
  };

  const toggleLocationPicking = () => {
    setIsPickingLocation((current) => !current);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B5BFF" />
        <Text style={styles.loadingText}>주변 치과를 찾는 중입니다</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={42} color="#FF6B9D" />
        <Text style={styles.errorTitle}>지도를 불러올 수 없습니다</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => loadDentists(activeQuery)}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textButton} onPress={() => router.back()}>
          <Text style={styles.textButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>주변 치과 찾기</Text>
          <Text style={styles.subtitle}>설정한 위치 기준 3km 이내</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={handleMyLocation}>
          <Ionicons name="refresh" size={21} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#8B90A0" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholder="치과명 또는 지역 검색"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {mapUrl ? (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ uri: mapUrl }}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            onMessage={handleMessage}
            style={styles.webView}
          />
        ) : null}
        <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
          <Ionicons name="locate" size={18} color="#3B5BFF" />
          <Text style={styles.myLocationText}>내 위치</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickLocationButton, isPickingLocation && styles.pickLocationButtonActive]}
          onPress={toggleLocationPicking}
        >
          <Ionicons name="pin-outline" size={18} color={isPickingLocation ? '#FFFFFF' : '#3B5BFF'} />
          <Text style={[styles.pickLocationText, isPickingLocation && styles.pickLocationTextActive]}>
            위치 설정
          </Text>
        </TouchableOpacity>
        {isPickingLocation ? (
          <View style={styles.pickHint}>
            <Text style={styles.pickHintText}>지도에서 기준 위치를 눌러주세요</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>
        {selectedDentist ? (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <View style={styles.pinIcon}>
                <Ionicons name="medical" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.selectedCopy}>
                <Text style={styles.selectedName} numberOfLines={1}>
                  {selectedDentist.name}
                </Text>
                <Text style={styles.selectedMeta}>{formatDistance(selectedDentist.distance)}</Text>
              </View>
            </View>
            <Text style={styles.address} numberOfLines={2}>
              {selectedDentist.address || '주소 정보 없음'}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                disabled={!selectedDentist.phone}
                style={[styles.actionButton, !selectedDentist.phone && styles.disabledActionButton]}
                onPress={() => callDentist(selectedDentist.phone)}
              >
                <Ionicons name="call-outline" size={18} color="#3B5BFF" />
                <Text style={styles.actionButtonText}>전화</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => openPlace(selectedDentist.placeUrl)}>
                <Ionicons name="navigate-outline" size={18} color="#3B5BFF" />
                <Text style={styles.actionButtonText}>상세보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {dentists.map((dentist) => {
            const selected = selectedDentist?.id === dentist.id;

            return (
              <Pressable
                key={dentist.id}
                style={[styles.dentistChip, selected && styles.selectedChip]}
                onPress={() => selectDentist(dentist)}
              >
                <Text style={[styles.chipName, selected && styles.selectedChipName]} numberOfLines={1}>
                  {dentist.name}
                </Text>
                <Text style={[styles.chipDistance, selected && styles.selectedChipDistance]}>
                  {formatDistance(dentist.distance)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 14,
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '800',
  },
  errorTitle: {
    marginTop: 16,
    color: '#1A1A2E',
    fontSize: 20,
    fontWeight: '900',
  },
  errorText: {
    marginTop: 8,
    color: '#727789',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#F4F6FF',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  title: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: '#727789',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    color: '#1A1A2E',
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  searchButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 14,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#EDEFF8',
  },
  webView: {
    flex: 1,
    backgroundColor: '#EDEFF8',
  },
  myLocationButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  myLocationText: {
    color: '#3B5BFF',
    fontSize: 13,
    fontWeight: '900',
  },
  pickLocationButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  pickLocationButtonActive: {
    backgroundColor: '#3B5BFF',
  },
  pickLocationText: {
    color: '#3B5BFF',
    fontSize: 13,
    fontWeight: '900',
  },
  pickLocationTextActive: {
    color: '#FFFFFF',
  },
  pickHint: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 64,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.86)',
    paddingHorizontal: 14,
  },
  pickHintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  selectedCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#FFFFFF',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FF6B9D',
  },
  selectedCopy: {
    flex: 1,
    minWidth: 0,
  },
  selectedName: {
    color: '#1A1A2E',
    fontSize: 17,
    fontWeight: '900',
  },
  selectedMeta: {
    marginTop: 3,
    color: '#3B5BFF',
    fontSize: 13,
    fontWeight: '800',
  },
  address: {
    marginTop: 10,
    color: '#727789',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    backgroundColor: '#F4F6FF',
  },
  disabledActionButton: {
    opacity: 0.45,
  },
  actionButtonText: {
    color: '#3B5BFF',
    fontSize: 14,
    fontWeight: '900',
  },
  listContent: {
    gap: 10,
    paddingTop: 12,
  },
  dentistChip: {
    width: 142,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#F7F9FC',
  },
  selectedChip: {
    borderColor: '#3B5BFF',
    backgroundColor: '#EEF3FF',
  },
  chipName: {
    color: '#29324A',
    fontSize: 13,
    fontWeight: '900',
  },
  selectedChipName: {
    color: '#3B5BFF',
  },
  chipDistance: {
    marginTop: 5,
    color: '#8B90A0',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedChipDistance: {
    color: '#3B5BFF',
  },
  primaryButton: {
    minWidth: 150,
    alignItems: 'center',
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  textButton: {
    marginTop: 12,
    padding: 10,
  },
  textButtonText: {
    color: '#727789',
    fontSize: 14,
    fontWeight: '800',
  },
});
