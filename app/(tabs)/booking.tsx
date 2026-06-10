import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../src/constants/colors';
export default function BookingsScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.text}>📅 Bronlarim — tez orada</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.neon, fontSize: 16 },
});