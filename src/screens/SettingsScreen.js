import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Settings</Text>
      <View style={{ marginTop: 12 }}>
        <Text>Profile / Notifications / Accessibility (coming soon)</Text>
      </View>
    </SafeAreaView>
  );
}
