import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

function createMapHtml({
  javascriptKey,
  location,
  dentists,
}: {
  javascriptKey: string;
  location: UserLocation;
  dentists: Dentist[];
}) {
  const safeDentists = JSON.stringify(dentists).replace(/</g, '\\u003c');

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .label {
        min-width: 128px;
        transform: translateY(-8px);
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid rgba(255, 107, 157, 0.28);
        background: #fff;
        color: #1a1a2e;
        box-shadow: 0 8px 18px rgba(21, 25, 54, 0.14);
        font-size: 12px;
        font-weight: 800;
        line-height: 1.35;
        white-space: nowrap;
      }
      .label span { display: block; margin-top: 2px; color: #727789; font-size: 11px; font-weight: 700; }
      .current {
        width: 18px;
        height: 18px;
        border: 4px solid #fff;
        border-radius: 50%;
        background: #3b5bff;
        box-shadow: 0 0 0 7px rgba(59, 91, 255, 0.18), 0 4px 12px rgba(0,0,0,0.18);
      }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${javascriptKey}&autoload=false"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const dentists = ${safeDentists};
      const userLocation = { latitude: ${location.latitude}, longitude: ${location.longitude} };

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function formatDistance(distance) {
        if (!distance) return '';
        return distance >= 1000 ? (distance / 1000).toFixed(1) + 'km' : distance + 'm';
      }

      function postDentist(dentist) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'dentist',
          dentist: dentist
        }));
      }

      kakao.maps.load(function () {
        const center = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
        const map = new kakao.maps.Map(document.getElementById('map'), { center: center, level: 4 });
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(center);

        new kakao.maps.CustomOverlay({
          position: center,
          content: '<div class="current"></div>',
          yAnchor: 0.5,
          xAnchor: 0.5,
          map: map
        });

        dentists.forEach(function (dentist) {
          const position = new kakao.maps.LatLng(dentist.latitude, dentist.longitude);
          const marker = new kakao.maps.Marker({ position: position, map: map });
          const content = '<button class="label" type="button">' +
            escapeHtml(dentist.name) +
            '<span>' + escapeHtml(formatDistance(dentist.distance)) + '</span></button>';
          const overlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1.55
          });

          bounds.extend(position);
          kakao.maps.event.addListener(marker, 'click', function () {
            overlay.setMap(map);
            postDentist(dentist);
          });
        });

        if (dentists.length > 0) {
          map.setBounds(bounds);
        }
      });
    </script>
  </body>
</html>`;
}

export default function DentistMapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [javascriptKey, setJavascriptKey] = useState('');
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDentists = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setErrorMessage('Location permission is required. Allow access and try again.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      const [configResponse, dentistsResponse] = await Promise.all([
        fetch(`${API_ORIGIN}/api/config/kakao-map`),
        fetch(`${API_ORIGIN}/api/dentists?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=3000`),
      ]);

      const configPayload = await configResponse.json();
      const dentistsPayload = await dentistsResponse.json();

      if (!configResponse.ok) {
        throw new Error(configPayload?.detail || configPayload?.error || 'Failed to load Kakao map config.');
      }

      if (!dentistsResponse.ok) {
        throw new Error(dentistsPayload?.detail || dentistsPayload?.error || 'Failed to load nearby dentists.');
      }

      const nextDentists = Array.isArray(dentistsPayload.dentists) ? dentistsPayload.dentists : [];
      setLocation(currentLocation);
      setJavascriptKey(configPayload.javascriptKey);
      setDentists(nextDentists);
      setSelectedDentist(nextDentists[0] || null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search nearby dentists.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDentists();
  }, [loadDentists]);

  const mapHtml = useMemo(() => {
    if (!location || !javascriptKey) {
      return '';
    }

    return createMapHtml({ javascriptKey, location, dentists });
  }, [dentists, javascriptKey, location]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);

      if (payload.type === 'dentist') {
        setSelectedDentist(payload.dentist);
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B5BFF" />
        <Text style={styles.loadingText}>Finding nearby dentists</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={42} color="#FF6B9D" />
        <Text style={styles.errorTitle}>Map unavailable</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={loadDentists}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textButton} onPress={() => router.back()}>
          <Text style={styles.textButtonText}>Go back</Text>
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
          <Text style={styles.title}>Nearby Dentists</Text>
          <Text style={styles.subtitle}>Within 3km of your location</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={loadDentists}>
          <Ionicons name="refresh" size={21} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {mapHtml ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml, baseUrl: API_ORIGIN }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMessage}
            style={styles.webView}
          />
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
              {selectedDentist.address || 'No address available'}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                disabled={!selectedDentist.phone}
                style={[styles.actionButton, !selectedDentist.phone && styles.disabledActionButton]}
                onPress={() => callDentist(selectedDentist.phone)}
              >
                <Ionicons name="call-outline" size={18} color="#3B5BFF" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => openPlace(selectedDentist.placeUrl)}>
                <Ionicons name="navigate-outline" size={18} color="#3B5BFF" />
                <Text style={styles.actionButtonText}>Details</Text>
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
                onPress={() => setSelectedDentist(dentist)}
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
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#EDEFF8',
  },
  webView: {
    flex: 1,
    backgroundColor: '#EDEFF8',
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
