// src/components/SessionPlayerRN.jsx
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { Video } from 'expo-av'
import { createClient } from '@supabase/supabase-js'

// --- Setup supabase client (anon key) ---
const SUPABASE_URL = 'https://lvebhpkdvvbxrvdbptfc.supabase.co' // e.g. https://lvebhpkdvvbxrvdbptfc.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZWJocGtkdnZieHJ2ZGJwdGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzcyNjAsImV4cCI6MjA3NzQ1MzI2MH0.FigoSpkJg93ZQgvFumNGUUKex7E6R56d8lp4ZfKtrvw' // put your anon key here (safe for read)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
Props:
  - exerciseId  (UUID)
  - useSignedUrlFn(optional) => async (bucket, path) -> signedUrl
    if you have a server that issues signed urls, pass a function that calls it;
    otherwise leave undefined and the component will use `url` field directly.
*/
export default function SessionPlayerRN({ exerciseId, useSignedUrlFn }) {
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const [secsLeft, setSecsLeft] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function getPrimaryVideoAsset(exId) {
    // fetch the primary video asset for the exercise
    const { data, error } = await supabase
      .from('exercise_assets')
      .select('id, exercise_id, asset_type, url, filename, mime, is_primary, is_public, metadata')
      .eq('exercise_id', exId)
      .eq('asset_type', 'video')
      .order('is_primary', { ascending: false })
      .limit(1)

    if (error) {
      console.error('supabase asset fetch error', error)
      throw error
    }
    return (data && data[0]) || null
  }

  async function resolvePlayableUrl(asset) {
    if (!asset) return null

    // if url is already a full http(s) URL, use it directly
    if (asset.url && asset.url.startsWith('http')) return asset.url

    // optionally, if you stored only path and have a bucket indicated in metadata, use signed endpoint
    const bucket = asset.metadata?.bucket || asset.metadata?.storage_bucket || null
    const path = asset.url || asset.filename || null
    if (useSignedUrlFn && bucket && path) {
      return await useSignedUrlFn(bucket, path)
    }

    // fallback - build public object path if you know project ref and bucket
    if (bucket && path) {
      // replace <project> below with your SUPABASE_URL host
      // but prefer providing full url in DB instead
      return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`
    }
    return null
  }

  async function startSession(minutes = 5) {
    setLoading(true)
    try {
      const asset = await getPrimaryVideoAsset(exerciseId)
      if (!asset) {
        Alert.alert('No video', 'No video asset found for this exercise.')
        setLoading(false)
        return
      }

      // If asset.url is a full URL (public) it will be used; otherwise we attempt signed URL via useSignedUrlFn
      const playable = await resolvePlayableUrl(asset)
      if (!playable) {
        Alert.alert('Cannot resolve video', 'Video URL not available or storage is private. Make bucket public or add signed-url server.')
        setLoading(false)
        return
      }

      setVideoUrl(playable)
      setSecsLeft(minutes * 60)
      setIsPlaying(true)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            setIsPlaying(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err) {
      console.error('startSession err', err)
      Alert.alert('Error', 'Failed to start session. Check console/logs.')
    } finally {
      setLoading(false)
    }
  }

  const formatted = `${Math.floor(secsLeft / 60)}:${String(secsLeft % 60).padStart(2, '0')}`

  return (
    <View style={{ padding: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => startSession(3)} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 6, marginRight: 8 }}>
          <Text style={{ color: 'white' }}>Start 3m</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => startSession(5)} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 6, marginRight: 8 }}>
          <Text style={{ color: 'white' }}>Start 5m</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => startSession(8)} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 6 }}>
          <Text style={{ color: 'white' }}>Start 8m</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12 }}>
        {secsLeft > 0 ? <Text>Status: {formatted} remaining</Text> : <Text>Status: Idle</Text>}
      </View>

      <View style={{ marginTop: 12 }}>
        {loading && <ActivityIndicator size="small" />}
        {videoUrl && (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={{ width: '100%', height: 300, backgroundColor: 'black', marginTop: 8 }}
            useNativeControls
            resizeMode="contain"
            shouldPlay={isPlaying}
            onPlaybackStatusUpdate={status => {
              if (!status.isPlaying && status.didJustFinish) {
                // session video finished
                setIsPlaying(false)
                if (timerRef.current) clearInterval(timerRef.current)
                setSecsLeft(0)
              }
            }}
          />
        )}
      </View>
    </View>
  )
}
