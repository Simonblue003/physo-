// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Select only the columns you have: title/description/video_url/image_url/rep_range etc
        const { data, error } = await supabase
          .from('exercises')
          .select('id,title,description,video_url,image_url,rep_range')
          .eq('is_active', true)
          .order('title', { ascending: true });

        console.log('supabase exercises', { data, error });
        if (error) {
          console.error(error);
          Alert.alert('Error loading exercises', error.message || String(error));
        } else if (mounted) {
          setExercises(data || []);
        }
      } catch (err) {
        console.error('fetch failed', err);
        Alert.alert('Fetch failed', String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator /></View>;

  if (!exercises.length) return (
    <View style={{flex:1, padding:20}}>
      <Text style={{fontSize:20, marginBottom:12}}>No exercises found</Text>
    </View>
  );

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:28,fontWeight:'700', textAlign:'center', marginBottom:8}}>Desk Reset</Text>
      <FlatList
        data={exercises}
        keyExtractor={(i)=>i.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => nav.navigate('Session', { exercise: item })}
            style={{flexDirection:'row', padding:12, marginVertical:8, borderRadius:10, backgroundColor:'#fff', elevation:1}}
          >
            <Image source={{ uri: item.image_url || undefined }} style={{width:100,height:70,borderRadius:6,backgroundColor:'#eee'}}/>
            <View style={{flex:1, paddingLeft:12, justifyContent:'center'}}>
              <Text style={{fontWeight:'700'}}>{item.title}</Text>
              <Text numberOfLines={2} style={{color:'#666', marginTop:4}}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
