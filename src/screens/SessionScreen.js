// src/screens/SessionScreen.js
import React from 'react';
import { View, Text, Button, SafeAreaView, ScrollView } from 'react-native';
import { Video } from 'expo-av';

export default function SessionScreen({ route, navigation }) {
  const { exercise } = route.params || {};

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView contentContainerStyle={{padding:16}}>
        <Text style={{fontSize:22, fontWeight:'700', marginBottom:8}}>{exercise?.title}</Text>
        <Text style={{color:'#555', marginBottom:12}}>{exercise?.description}</Text>

        {exercise?.video_url ? (
          <Video
            source={{ uri: exercise.video_url }}
            useNativeControls
            resizeMode="contain"
            style={{ width: '100%', height: 300, backgroundColor:'#000' }}
            onError={(e) => console.warn('Video error', e)}
          />
        ) : (
          <Text>No video available for this exercise.</Text>
        )}

        <View style={{ marginTop: 16 }}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
