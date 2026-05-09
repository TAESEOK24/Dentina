import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// 로컬 환경 백엔드 주소 (개발자 IP)
const API_URL = 'http://192.168.55.141:3000/api/analyze';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 사용 권한이 필요합니다.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        imageBase64: base64,
      });
      
      const result = response.data;
      
      // 결과 화면으로 데이터 전달
      router.replace({
        pathname: '/result',
        params: { resultData: JSON.stringify(result) }
      });
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('분석 실패', '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.5,
        });
        
        if (photo && photo.base64) {
          setPreviewPhoto(photo.base64); // 사진 촬영 후 미리보기 상태로 설정
        }
      } catch (error) {
        Alert.alert('촬영 실패', '사진 촬영 중 문제가 발생했습니다.');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPreviewPhoto(result.assets[0].base64); // 갤러리 선택 후 미리보기 상태로 설정
    }
  };

  return (
    <View style={styles.container}>
      {/* 닫기 버튼 (모달용) */}
      {!previewPhoto && !loading && (
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B8B" />
          <Text style={styles.loadingText}>AI가 구강 상태를 분석 중입니다...</Text>
        </View>
      ) : previewPhoto ? (
        // 미리보기 화면
        <View style={styles.previewContainer}>
          <Image source={{ uri: `data:image/jpeg;base64,${previewPhoto}` }} style={styles.previewImage} />
          
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retakeButton]} 
              onPress={() => setPreviewPhoto(null)}
            >
              <Ionicons name="refresh" size={24} color="#333" style={{marginRight: 8}} />
              <Text style={styles.retakeText}>다시 찍기</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.analyzeButton]} 
              onPress={() => analyzeImage(previewPhoto)}
            >
              <Ionicons name="sparkles" size={24} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.analyzeText}>이 사진으로 AI 분석</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 카메라 화면
        <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
          {/* 상단 컨트롤 영역 */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* 하단 컨트롤 영역 */}
          <View style={styles.bottomControls}>
            {/* 왼쪽: 갤러리 */}
            <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color="#fff" />
            </TouchableOpacity>

            {/* 중앙: 촬영 버튼 */}
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            
            {/* 오른쪽: 빈 공간 (균형을 위해) */}
            <View style={styles.sideButton} />
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 25,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  sideButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF6B8B',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  // 미리보기 화면 스타일
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionButton: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  retakeButton: {
    backgroundColor: '#F0F0F0',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: '#FF6B8B',
    shadowColor: '#FF6B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
