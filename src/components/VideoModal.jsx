// src/components/VideoModal.jsx
import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export default function VideoModal({ visible, videoUrl, title, onClose }) {
  const videoRef = useRef(null);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {videoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          ) : (
            <Text>No video URL</Text>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={() => { videoRef.current?.pauseAsync?.(); onClose(); }}>
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '92%', maxHeight: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  video: { width: '100%', height: 240, backgroundColor: '#000' },
  closeBtn: { marginTop: 12, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1976D2', borderRadius: 8 }
});
