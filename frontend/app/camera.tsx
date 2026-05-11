import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import { Ionicons } from '@expo/vector-icons';

const COUNTDOWN_START = 5;

const getApiUrl = () => {
  const manifest = Constants.manifest as { debuggerHost?: string } | null;
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  const manifest2 = Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null;
  const hostUri = expoConfig?.hostUri || manifest2?.extra?.expoClient?.hostUri || manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];

  return `http://${host || '192.168.1.6'}:3000/api/analyze`;
};

const API_URL = getApiUrl();

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const hasCapturedRef = useRef(false);
  const router = useRouter();

  const analyzeImage = useCallback(
    async (base64: string) => {
      setIsAnalyzing(true);

      try {
        const response = await axios.post(API_URL, {
          imageBase64: base64,
        });

        router.replace({
          pathname: '/result',
          params: { resultData: JSON.stringify(response.data) },
        });
      } catch (error) {
        const detail = isAxiosError(error)
          ? error.response?.data?.detail || error.response?.data?.error || error.message
          : '이미지 분석 중 오류가 발생했습니다.';

        Alert.alert('분석 실패', detail);
        hasCapturedRef.current = false;
        setCountdown(COUNTDOWN_START);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [router],
  );

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || hasCapturedRef.current) {
      return;
    }

    hasCapturedRef.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        throw new Error('촬영 이미지 변환에 실패했습니다.');
      }

      setPreviewPhoto(photo.base64);
    } catch (error) {
      const message = error instanceof Error ? error.message : '사진 촬영 중 문제가 발생했습니다.';
      Alert.alert('촬영 실패', message);
      hasCapturedRef.current = false;
      setCountdown(COUNTDOWN_START);
    }
  }, []);

  useEffect(() => {
    if (!permission?.granted || isAnalyzing || previewPhoto || hasCapturedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        takePicture();
        return;
      }

      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isAnalyzing, permission?.granted, previewPhoto, takePicture]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleRetake = () => {
    setPreviewPhoto(null);
    setCountdown(COUNTDOWN_START);
    hasCapturedRef.current = false;
  };

  const handleCancel = () => {
    hasCapturedRef.current = true;
    router.replace('/');
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>카메라 권한이 필요합니다</Text>
        <Text style={styles.permissionDescription}>구강 촬영을 위해 카메라 접근을 허용해주세요.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionCancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (previewPhoto) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: `data:image/jpeg;base64,${previewPhoto}` }} style={styles.previewImage} />

        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>촬영 결과</Text>
        </View>

        <View style={styles.previewActions}>
          {isAnalyzing ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.previewLoadingText}>분석 중</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
                <Text style={styles.secondaryButtonText}>다시 촬영</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => analyzeImage(previewPhoto)}>
                <Text style={styles.primaryButtonText}>분석하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewCancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.topArea}>
            <Text style={styles.readyText}>촬영 준비 완료!</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="카메라 전환"
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.guideArea}>
            <View style={styles.guideFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              <View style={styles.deviceBody}>
                <View style={styles.deviceLens} />
                <View style={styles.deviceHandle} />
              </View>
              <Text style={styles.guideText}>OralScope</Text>
            </View>
          </View>

          <View style={styles.bottomArea}>
            <View style={styles.countdownBox}>
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.analyzingText}>분석 중</Text>
                </>
              ) : (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isAnalyzing}
              style={[styles.cancelButton, isAnalyzing && styles.disabledButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    paddingHorizontal: 24,
    paddingBottom: 42,
    paddingTop: 64,
  },
  topArea: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  readyText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  flipButton: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  guideArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFrame: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  corner: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    left: 20,
    top: 20,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 18,
  },
  cornerTopRight: {
    right: 20,
    top: 20,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 18,
  },
  cornerBottomLeft: {
    left: 20,
    bottom: 20,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 18,
  },
  cornerBottomRight: {
    right: 20,
    bottom: 20,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 18,
  },
  deviceBody: {
    width: 108,
    height: 150,
    alignItems: 'center',
  },
  deviceLens: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(59, 91, 255, 0.24)',
  },
  deviceHandle: {
    width: 38,
    height: 72,
    marginTop: -8,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  guideText: {
    position: 'absolute',
    bottom: 42,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bottomArea: {
    alignItems: 'center',
  },
  countdownBox: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 88,
    fontWeight: '900',
    lineHeight: 102,
    textAlign: 'center',
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
  },
  cancelButton: {
    minWidth: 148,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 28,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionDescription: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
    textAlign: 'center',
  },
  permissionButton: {
    minWidth: 160,
    alignItems: 'center',
    borderRadius: 26,
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  permissionCancelButton: {
    marginTop: 18,
    padding: 10,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    top: 64,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  previewActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  previewLoading: {
    minWidth: 148,
    minHeight: 94,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
  },
  previewLoadingText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 28,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
    paddingHorizontal: 28,
    paddingVertical: 15,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  previewCancelButton: {
    minWidth: 148,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
