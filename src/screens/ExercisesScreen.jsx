// src/screens/ExercisesScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import VideoModal from '../components/VideoModal';

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // exercise selected (object)

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setLoading(true);
    try {
      // Adjust select columns to your schema (title or name)
      const { data, error } = await supabase
        .from('exercises') // or 'physio_exercises' depending on tab
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
        // Map back to fields you use: prefer title then name
        const normalized = (data || []).map(row => ({
          id: row.id,
          title: row.title ?? row.name ?? row.slug ?? 'Untitled',
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

  function onPressExercise(item) {
    if (!item.video_url) {
      Alert.alert('No demo video', 'This exercise has no demo video URL.');
      return;
    }
    setSelected(item);
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

      {/* Video modal */}
      <VideoModal
        visible={!!selected}
        videoUrl={selected?.video_url}
        title={selected?.title}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
