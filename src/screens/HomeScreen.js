// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { supabase } from '../supabaseClient';

const durations = [3, 5, 8];

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      // session_templates should have a column like duration_minutes or slug
      const { data, error } = await supabase
        .from('session_templates')
        .select('*')
        .order('duration_minutes', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.warn('Failed to load templates', err.message || err);
    } finally {
      setLoading(false);
    }
  }

  function start(duration) {
    // find appropriate template row by duration (fallback: send duration only)
    const tpl = templates.find(t => Number(t.duration_minutes) === Number(duration));
    navigation.navigate('Session', { duration, templateId: tpl?.id ?? null });
  }

  return (
    <SafeAreaView style={{flex:1, padding:20}}>
      <Text style={styles.title}>Desk Reset</Text>
      <Text style={styles.sub}>Quick 3 / 5 / 8 minute workouts</Text>

      <View style={{ flexDirection:'row', marginTop:20, justifyContent: 'space-between' }}>
        {durations.map(d => (
          <TouchableOpacity key={d} style={styles.button} onPress={() => start(d)}>
            <Text style={styles.buttonText}>Start {d}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        {loading ? <ActivityIndicator /> : <Text style={{textAlign:'center'}}>Status: {templates.length ? `Loaded ${templates.length} templates` : 'No templates found'}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize:32, fontWeight:'700', textAlign:'center', marginTop:8 },
  sub: { textAlign:'center', color:'#666', marginTop:4 },
  button: { backgroundColor:'#2b82ff', paddingVertical:14, paddingHorizontal:22, borderRadius:12, minWidth:100, alignItems:'center' },
  buttonText: { color:'#fff', fontWeight:'700' }
});
