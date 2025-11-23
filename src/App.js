// src/App.js
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Alert, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  const [lastAction, setLastAction] = useState('');

  function startSession(minutes) {
    setLastAction(`Started ${minutes} minute session`);
    Alert.alert('Session start', `Starting ${minutes}-minute session`);
    // TODO: open player screen / load session template / start timer
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Desk Reset</Text>
        <Text style={styles.subtitle}>Quick 3 / 5 / 8 minute workouts</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.btn} onPress={() => startSession(3)}>
            <Text style={styles.btnText}>Start 3m</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => startSession(5)}>
            <Text style={styles.btnText}>Start 5m</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => startSession(8)}>
            <Text style={styles.btnText}>Start 8m</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.small}>Status: {lastAction || 'idle'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12 },
  btn: { flex: 1, marginHorizontal: 6, paddingVertical: 14, backgroundColor: '#2f80ed', borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
  small: { color: '#666', textAlign: 'center' }
});
