// src/screens/SessionScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { Video } from 'expo-av';

export default function SessionScreen({ route, navigation }) {
  const { duration, templateId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    setLoading(true);
    try {
      if (templateId) {
        // fetch session_template_steps linked to template
        const { data, error } = await supabase
          .from('session_template_steps')
          .select(`*, exercises(*)`)
          .eq('template_id', templateId)
          .order('step_order', { ascending: true });

        if (error) throw error;

        // Map to items with video_url / image_url available from exercises
        const items = (data || []).map(row => {
          const ex = row.exercises || {};
          return {
            id: row.id,
            title: ex.title ?? ex.name ?? row.title ?? 'Step',
            description: ex.description ?? row.instructions ?? row.instructions,
            video_url: ex.video_url ?? ex.video ?? null,
            image_url: ex.image_url ?? null,
            rep_range: ex.rep_range ?? null,
          };
        });
        setSteps(items);
      } else {
        // fallback: query exercises table and pick some items for a quick demo
        const { data, error } = await supabase
          .from('exercises')
          .select('id,title,description,video_url,image_url,rep_range')
          .limit(12);
        if (error) throw error;
        setSteps((data || []).map(ex => ({ id: ex.id, title: ex.title, description: ex.description, video_url: ex.video_url, image_url: ex.image_url })));
      }
    } catch (err) {
      console.error('loadSession error', err);
      Alert.alert('Error', 'Could not load session data. Check Supabase env and table names.');
    } finally {
      setLoading(false);
    }
  }

  function openVideo(item) {
    if (!item?.video_url) {
      Alert.alert('No demo video', 'This exercise has no video_url set.');
      return;
    }
    setCurrentVideo(item.video_url);
    // scroll into view is optional; video player shown at top
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <View style={{padding:16}}>
        <Text style={{fontSize:22,fontWeight:'700',textAlign:'center'}}>Session: {duration} min</Text>
      </View>

      {currentVideo ? (
        <View style={{height:220, padding:8}}>
          <Video
            ref={videoRef}
            source={{ uri: currentVideo }}
            style={{ flex:1, borderRadius:8, backgroundColor:'#000' }}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
          <TouchableOpacity style={{marginTop:8, alignSelf:'center'}} onPress={() => setCurrentVideo(null)}>
            <Text style={{ color: '#2b82ff' }}>Close video</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{flex:1, padding:12}}>
        {loading ? <ActivityIndicator /> : (
          <FlatList
            data={steps}
            keyExtractor={i=>String(i.id)}
            ListEmptyComponent={<Text style={{textAlign:'center', color:'#666'}}>No steps found.</Text>}
            renderItem={({item}) => (
              <TouchableOpacity style={styles.card} onPress={() => openVideo(item)}>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
                  {item.rep_range ? <Text style={{marginTop:6, color:'#666'}}>Reps: {item.rep_range}</Text> : null}
                  <Text style={{marginTop:8, color:'#2b82ff'}}>Tap to view demo video</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#fff', padding:14, borderRadius:10, marginBottom:12, elevation:1 },
  cardTitle: { fontSize:16, fontWeight:'700' },
  cardDesc: { marginTop:6, color:'#666' },
});
