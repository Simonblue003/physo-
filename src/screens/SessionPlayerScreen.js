import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import Timer from '../components/Timer';

export default function SessionPlayerScreen({ route, navigation }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    async function load() {
      const { data: s, error: e1 } = await supabase.from('session_templates').select('*').eq('id', sessionId).single();
      if (e1) { console.error(e1); return; }
      const { data: st, error: e2 } = await supabase
        .from('session_template_steps')
        .select('*')
        .eq('session_template_id', sessionId)
        .order('step_order', { ascending: true });
      if (e2) { console.error(e2); return; }
      setSession(s);
      setSteps(st || []);
    }
    load();
  }, [sessionId]);

  function onCompleteSession() {
    // award points + update streak locally (basic)
    Alert.alert('Well done!', 'Session complete — points awarded.');
    // You should store completion in DB for persistent points/streaks
    navigation.goBack();
  }

  if (!session) return <SafeAreaView><Text style={{padding:20}}>Loading…</Text></SafeAreaView>;

  const currentStep = steps[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>{session.title}</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>{Math.round(session.duration_seconds/60)} min</Text>

      <View style={{ marginTop: 20 }}>
        {currentStep ? (
          <>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{currentStep.step_name}</Text>
            <Text style={{ color: '#444', marginTop: 8 }}>{currentStep.instructions}</Text>
            <Timer
              key={currentStep.id}
              seconds={currentStep.duration_seconds || 20}
              onFinish={() => {
                if (currentIndex + 1 < steps.length) setCurrentIndex(i => i + 1);
                else onCompleteSession();
              }}
              ref={timerRef}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => timerRef.current?.togglePause()} style={{ padding: 12 }}>
                <Text>Pause/Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (currentIndex + 1 < steps.length) setCurrentIndex(i => i + 1);
              }} style={{ padding: 12 }}>
                <Text>Skip</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text>No steps found for this session.</Text>
        )}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: '600' }}>Steps</Text>
        <FlatList
          data={steps}
          keyExtractor={s => s.id}
          renderItem={({ item, index }) => (
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontWeight: index === currentIndex ? '700' : '500' }}>{index + 1}. {item.step_name} • {item.duration_seconds}s</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
