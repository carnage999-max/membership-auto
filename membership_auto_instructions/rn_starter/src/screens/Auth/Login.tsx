import React from 'react';
import { View, Text, Button } from 'react-native';
export default function Login({ navigation }: any) {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Login Placeholder</Text>
      <Button title="Sign up" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}
