// src/screens/ExercisesScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import VideoModalRN from '../components/VideoModalRN';

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { item, videoUrl }
  const [modalVisible, setModalVisible] = useState(false);
  const [resolvingVideo, setResolvingVideo] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          id,
          title,
          name,
          description,
          image_url,
          video_url,
          difficulty,
          target_muscle,
          is_active
        `)
        .eq('is_active', true)
        .limit(200);

      if (error) {
        console.error('supabase fetch error', error);
        Alert.alert('Data error', error.message || 'Failed to load exercises');
      } else {
        const normalized = (data || []).map(row => ({
          id: row.id,
          title: row.title ?? row.name ?? 'Untitled',
          description: row.description ?? '',
          image_url: row.image_url ?? null,
          video_url: row.video_url ?? null,
          difficulty: row.difficulty ?? null
        }));
        setExercises(normalized);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Fetch failed', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  // helper: fetch primary video asset from exercise_assets for an exercise id
  async function fetchPrimaryAssetUrlForExercise(exerciseId) {
    try {
      const { data, error } = await supabase
        .from('exercise_assets')
        .select('id, exercise_id, asset_type, url, filename, mime, is_primary, metadata')
        .eq('exercise_id', exerciseId)
        .eq('asset_type', 'video')
        .order('is_primary', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('asset fetch error', error);
        return null;
      }
      const asset = (data && data[0]) || null;
      if (!asset) return null;

      // Prefer full public URL if present
      if (asset.url && asset.url.startsWith('http')) return asset.url;

      // If asset.url is a storage path or filename, attempt to build public URL using bucket in metadata
      const bucket = asset.metadata?.bucket || asset.metadata?.storage_bucket || null;
      const path = asset.url || asset.filename || null;
      if (bucket && path) {
        // Make sure your bucket is public; this is the public object URL format for Supabase storage:
        // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        const supabaseUrl = supabase?.supabaseUrl || null; // supabase client exposes this
        if (supabaseUrl) {
          return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
        }
        // fallback: return path (unlikely to work)
        return path;
      }

      return null;
    } catch (err) {
      console.error('fetchPrimaryAssetUrlForExercise err', err);
      return null;
    }
  }

  async function onPressExercise(item) {
    setResolvingVideo(true);
    try {
      // If exercise row already has a video_url, use it
      if (item.video_url && item.video_url.startsWith('http')) {
        setSelected({ item, videoUrl: item.video_url });
        setModalVisible(true);
        return;
      }

      // Otherwise try to fetch from exercise_assets
      const url = await fetchPrimaryAssetUrlForExercise(item.id);
      if (!url) {
        Alert.alert('No demo video', 'This exercise has no demo video URL or the asset was not found.');
        return;
      }

      setSelected({ item, videoUrl: url });
      setModalVisible(true);
    } catch (err) {
      console.error('onPressExercise err', err);
      Alert.alert('Error', 'Failed to resolve video for this exercise.');
    } finally {
      setResolvingVideo(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Exercises</Text>

      {loading ? <ActivityIndicator size="large" /> : (
        <>
          {exercises.length === 0 ? (
            <Text>No exercises found.</Text>
          ) : (
            <FlatList
              data={exercises}
              keyExtractor={i => String(i.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onPressExercise(item)}
                  style={{
                    flexDirection: 'row',
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: '#f7f7f7',
                    marginBottom: 10,
                    alignItems: 'center'
                  }}
                >
                  <Image
                    source={ item.image_url ? { uri: item.image_url } : require('../../assets/no-image.png') }
                    style={{ width: 96, height: 72, borderRadius: 8, marginRight: 12, backgroundColor: '#ececec' }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
                    <Text numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {/* Video modal (native) */}
      <VideoModalRN
        visible={modalVisible}
        videoUrl={selected?.videoUrl}
        title={selected?.item?.title}
        onClose={() => {
          setModalVisible(false);
          setSelected(null);
        }}
      />

      {/* small loader when resolving video */}
      {resolvingVideo && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={{ marginTop: 6 }}>Resolving video…</Text>
        </View>
      )}
    </View>
  );
}
