// app/(auth)/login.tsx
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener este paquete instalado
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >
        <View style={styles.header}>
            <Image
                source={require('../../assets/images/filograficos-logo.png')}
                style={styles.logo}
            />
            <Text style={styles.logoTitle}>Filográficos</Text>
            <Text style={styles.logoSubtitle}>Personaliza tus productos</Text>
        </View>

        <View style={styles.formContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={24} color="#888" style={styles.icon} />
            <TextInput
                style={styles.input}    
                placeholder="tu@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"    
                autoCapitalize="none"
            />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#888" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="********"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
            >
            {loading ? (
            <ActivityIndicator color="#fff" />
            ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
        </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002558', // Fondo azul oscuro
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginTop: '20%', // Espacio desde arriba
    marginBottom: '10%', // Espacio entre el logo y el formulario
  },
  logo: {
    width: 100, // Ajusta el tamaño del logo según sea necesario
    height: 100,
    resizeMode: 'contain',
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    padding: 25,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1, // Hace que ocupe el resto del espacio
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  loginButton: {
    backgroundColor: '#0056b3', // Color del botón
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;