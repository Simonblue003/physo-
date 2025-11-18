// src/screens/Home.js
import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Home({ navigation }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('session_templates')
        .select('id,slug,title,duration_seconds,thumbnail')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('load sessions', error)
      } else setSessions(data || [])
    }
    load()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Quick Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('SessionPlayer', { sessionId: item.id })}
            style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', padding: 8, elevation: 2 }}
          >
            {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={{ height: 120, width: '100%', borderRadius: 8 }} /> : null}
            <View style={{ padding: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>{Math.round(item.duration_seconds/60)} min</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}
