import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
export default function Splash({ navigation }: any) {
  useEffect(() => {
    setTimeout(() => navigation.replace('Auth'), 1000);
  }, []);
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:24 }}>Membership Auto</Text>
      <ActivityIndicator />
    </View>
  );
}
