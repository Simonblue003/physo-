import React, {useState, useRef} from 'react';
<Text style={styles.title}>Desk Reset</Text>
<Text style={styles.subtitle}>Quick 3 / 5 / 8 minute workouts</Text>
<View style={styles.row}>
<TouchableOpacity style={styles.btn} onPress={() => { setStatusText('Started 3 minute session'); loadPlaylist(3); }}>
<Text style={styles.btnText}>Start 3m</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.btn} onPress={() => { setStatusText('Started 5 minute session'); loadPlaylist(5); }}>
<Text style={styles.btnText}>Start 5m</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.btn} onPress={() => { setStatusText('Started 8 minute session'); loadPlaylist(8); }}>
<Text style={styles.btnText}>Start 8m</Text>
</TouchableOpacity>
</View>


<Text style={styles.status}>Status: {statusText}</Text>
{loading && <ActivityIndicator style={{marginTop:12}}/>}


<Modal visible={playerVisible} animationType="slide" onRequestClose={() => setPlayerVisible(false)}>
<View style={{flex:1, backgroundColor:'#000'}}>
<Text style={{color:'#fff',textAlign:'center', padding:12}}>{playlist[currentIndex] ? playlist[currentIndex].title : 'Playing'}</Text>
{playlist[currentIndex] && (
<Video
ref={videoRef}
style={{flex:1}}
source={{ uri: playlist[currentIndex].url }}
useNativeControls
resizeMode="contain"
shouldPlay
onPlaybackStatusUpdate={onPlaybackStatusUpdate}
/>
)}
<TouchableOpacity style={styles.closeBtn} onPress={() => setPlayerVisible(false)}>
<Text style={{color:'#fff'}}>Close</Text>
</TouchableOpacity>
</View>
</Modal>
</View>
);
}


const styles = StyleSheet.create({
container:{flex:1, paddingTop:70, alignItems:'center', backgroundColor:'#fff'},
title:{fontSize:36, fontWeight:'700'},
subtitle:{color:'#666', marginTop:6, marginBottom:20},
row:{flexDirection:'row', justifyContent:'space-between', width:'92%'},
btn:{backgroundColor:'#2176FF', paddingVertical:14, paddingHorizontal:22, borderRadius:10, marginHorizontal:6},
btnText:{color:'#fff', fontWeight:'700'},
status:{marginTop:20, color:'#555'},
closeBtn:{padding:12, backgroundColor:'#111', alignItems:'center'}
});
