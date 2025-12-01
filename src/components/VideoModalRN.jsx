// src/components/VideoModalRN.jsx
import React, { useRef, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Video } from 'expo-av'

export default function VideoModalRN({ visible, videoUrl, title = 'Exercise demo', onClose }) {
  const videoRef = useRef(null)

  useEffect(() => {
    // start playback automatically when modal opens (if video is ready)
    if (visible && videoRef.current) {
      // nothing to do here – controlled by shouldPlay prop below
    }
  }, [visible])

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.playerWrap}>
            {videoUrl ? (
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                shouldPlay
                isLooping={false}
                onError={(e) => {
                  console.warn('Video playback error', e)
                }}
              />
            ) : (
              <View style={styles.noVideo}>
                <Text>No video URL supplied</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '600' },
  closeBtn: { padding: 6 },
  closeText: { color: '#2563eb', fontWeight: '600' },
  playerWrap: { padding: 12 },
  video: { width: '100%', height: 280, backgroundColor: 'black' },
  noVideo: { height: 280, alignItems: 'center', justifyContent: 'center' },
})
