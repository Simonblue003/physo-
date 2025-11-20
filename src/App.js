import React from "react";
import { SafeAreaView, View, Text, Button, StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Desk Reset</Text>
        <Text style={styles.subtitle}>App root is healthy  replace with your real UI</Text>
        <Button title="Quick check" onPress={() => alert("App is running")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  card: { padding: 20, borderRadius: 8, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 12, color: "#444" }
});
