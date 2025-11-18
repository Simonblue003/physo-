// src/screens/SessionPlayer.js
import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, Button, FlatList } from 'react-native'
import { supabase } from '../lib/supabase'

export default function SessionPlayer({ route }) {
  const { sessionId } = route.params
  const [session, setSession] = useState(null)
  const [steps, setSteps] = useState([])

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('session_templates').select('*').eq('id', sessionId).single()
      setSession(s)
      const { data: st } = await supabase
        .from('session_template_steps')
        .select('*')
        .eq('session_template_id', sessionId)
        .order('step_order', { ascending: true })
      setSteps(st || [])
    }
    load()
  }, [sessionId])

  if (!session) return <SafeAreaView><Text>Loading…</Text></SafeAreaView>

  return (
    <SafeAreaView style={{ flex:1, padding: 16 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>{session.title}</Text>
      <Text style={{ marginBottom:10 }}>{Math.round(session.duration_seconds/60)} min</Text>

      <FlatList
        data={steps}
        keyExtractor={(i)=>i.id}
        renderItem={({item})=>(
          <View style={{ padding:10, borderBottomWidth:1, borderBottomColor:'#eee' }}>
            <Text style={{ fontWeight:'600' }}>{item.step_name}</Text>
            <Text style={{ color:'#666' }}>{item.instructions}</Text>
            <Text style={{ color:'#999', marginTop:6 }}>{item.duration_seconds}s</Text>
          </View>
        )}
      />

      <View style={{ marginTop: 12 }}>
        <Button title="Start Session" onPress={()=> alert('Implement countdown/player next')} />
      </View>
    </SafeAreaView>
  )
}
