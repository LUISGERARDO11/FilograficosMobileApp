import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

const HomeScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      {user ? (
        <Text style={styles.subtitle}>{user.name}</Text>
      ) : (
        <Text style={styles.subtitle}>Usuario no definido</Text>
      )}
      <Button title="Cerrar Sesión" onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default HomeScreen;