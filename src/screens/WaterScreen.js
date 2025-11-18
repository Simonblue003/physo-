import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@water_log_today';

export default function WaterScreen() {
  const [cups, setCups] = useState(0);
  useEffect(() => {
    async function load() {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setCups(raw ? Number(raw) : 0);
    }
    load();
  }, []);

  async function addCup() {
    const next = cups + 1;
    setCups(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  }

  async function reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setCups(0);
  }

  return (
    <SafeAreaView style={{ flex:1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Water Tracker</Text>
      <Text style={{ marginTop: 8 }}>Goal: 8 cups</Text>
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: '700' }}>{cups} / 8</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <TouchableOpacity onPress={addCup} style={{ padding: 12, backgroundColor: '#0b84ff', borderRadius: 8, alignItems:'center' }}>
          <Text style={{ color: 'white' }}>+1 cup</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          Alert.alert('Reset', 'Reset today\'s water?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', onPress: reset, style: 'destructive' }
          ]);
        }} style={{ marginTop: 12, padding: 12 }}>
          <Text style={{ color: '#555' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
