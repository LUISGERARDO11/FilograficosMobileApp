import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity, useColorScheme, View
} from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const { signIn } = useAuth();

   // Usar el hook para obtener el esquema de color
   const colorScheme = useColorScheme();

   // Definir los colores para el tema actual
   const backgroundColor = useThemeColor({ light: '#002558', dark: '#1e293b' }, 'background');
   const cardBackgroundColor = useThemeColor({ light: '#fff', dark: '#1e1e1e' }, 'background');
   const textColor = useThemeColor({ light: '#333', dark: '#fff' }, 'text');
   const placeholderTextColor = useThemeColor({ light: '#888', dark: '#a0a0a0' }, 'icon');
   const inputBackgroundColor = useThemeColor({ light: '#f8f8f8', dark: '#282828' }, 'background');
   const loginButtonColor = useThemeColor({ light: '#0056b3', dark: '#16a34a' }, 'tint');
   const loginButtonDisabledColor = useThemeColor({ light: '#a0a0a0', dark: '#444' }, 'tabIconDefault');
   const logoTitleColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
   const logoSubtitleColor = useThemeColor({ light: '#fff', dark: '#bbb' }, 'text');

   const handleLogin = async () => {
     if (!isFormValid) return;
     setLoading(true);
     try {
       await signIn(email, password);
     } catch (error: any) {
       // NOTA: Reemplazar Alert.alert con un modal personalizado.
       // Alert.alert('Error', error.message);
       console.error('Error de inicio de sesión:', error.message);
     } finally {
       setLoading(false);
     }
   };

   const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
   const isEmailValid = isValidEmail(email);
   const isPasswordValid = password.trim().length > 0;
   const isFormValid = isEmailValid && isPasswordValid;

   return (
     <KeyboardAvoidingView
       style={[styles.container, { backgroundColor: backgroundColor }]}
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
     >
       <ScrollView
         style={styles.scrollView}
         contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
         keyboardShouldPersistTaps="handled"
         bounces={false}
       >
         <View style={[styles.header, { backgroundColor: backgroundColor }]}>
           <Image
             source={require('../../assets/images/filograficos-logo.png')}
             style={styles.logo}
           />
           <Text style={[styles.logoTitle, { color: logoTitleColor }]}>Filográficos</Text>
           <Text style={[styles.logoSubtitle, { color: logoSubtitleColor }]}>Personaliza tus productos</Text>
         </View>

         <View style={[styles.formContainer, { backgroundColor: cardBackgroundColor }]}>
           <View style={styles.labelRow}>
             <Text style={[styles.label, { color: textColor }]}>Correo electrónico</Text>
             <Text style={styles.required}>*</Text>
           </View>
           <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
             <Ionicons name="mail-outline" size={24} color={placeholderTextColor} style={styles.icon} />
             <TextInput
               style={[styles.input, { color: textColor }]}
               placeholder="tu@correo.com"
               placeholderTextColor={placeholderTextColor}
               value={email}
               onChangeText={setEmail}
               keyboardType="email-address"
               autoCapitalize="none"
               returnKeyType="next"
             />
           </View>
           {!isEmailValid && email.length > 0 && (
             <Text style={styles.errorText}>Ingresa un correo válido</Text>
           )}

           <View style={styles.labelRow}>
             <Text style={[styles.label, { color: textColor }]}>Contraseña</Text>
             <Text style={styles.required}>*</Text>
           </View>
           <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
             <Ionicons name="lock-closed-outline" size={24} color={placeholderTextColor} style={styles.icon} />
             <TextInput
               style={[styles.input, { color: textColor }]}
               placeholder="********"
               placeholderTextColor={placeholderTextColor}
               value={password}
               onChangeText={setPassword}
               secureTextEntry={!showPassword}
               returnKeyType="done"
               onSubmitEditing={handleLogin}
             />
             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
               <Ionicons
                 name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                 size={24}
                 color={placeholderTextColor}
               />
             </TouchableOpacity>
           </View>
           {!isPasswordValid && password.length === 0 && (
             <Text style={styles.errorText}>La contraseña es obligatoria</Text>
           )}

           <TouchableOpacity
             style={[styles.loginButton, !isFormValid && styles.loginButtonDisabled, { backgroundColor: isFormValid ? loginButtonColor : loginButtonDisabledColor }]}
             onPress={handleLogin}
             disabled={!isFormValid || loading}
           >
             {loading ? (
               <ActivityIndicator color="#fff" />
             ) : (
               <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
             )}
           </TouchableOpacity>
         </View>
         <View style={[styles.bottomSpacer, { backgroundColor: cardBackgroundColor }]} />
       </ScrollView>
     </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
     flex: 1,
     // Color dinámico, se elimina el valor fijo
   },
   scrollView: {
     flex: 1,
   },
   scrollContent: {
     flexGrow: 1,
     minHeight: '100%',
   },
   header: {
     alignItems: 'center',
     paddingTop: 80,
     paddingBottom: 40,
     // Color dinámico
   },
   logo: {
     width: 100,
     height: 100,
     resizeMode: 'contain',
   },
   logoTitle: {
     fontSize: 32,
     fontWeight: 'bold',
     marginTop: 10,
     // Color dinámico
   },
   logoSubtitle: {
     fontSize: 16,
     marginTop: 5,
     opacity: 0.8,
     // Color dinámico
   },
   formContainer: {
     flex: 1,
     borderTopLeftRadius: 40,
     borderTopRightRadius: 40,
     paddingHorizontal: 25,
     paddingTop: 30,
     paddingBottom: 40,
     minHeight: 450,
     // Color dinámico
   },
   labelRow: {
     flexDirection: 'row',
     alignItems: 'center',
   },
   label: {
     fontSize: 16,
     fontWeight: 'bold',
     marginTop: 20,
     marginBottom: 10,
     // Color dinámico
   },
   required: {
     fontSize: 16,
     color: 'red',
     marginTop: 20,
     marginLeft: 5,
   },
   inputContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     height: 50,
     borderWidth: 1,
     borderRadius: 8,
     marginBottom: 10,
     paddingHorizontal: 15,
     // Color dinámico
   },
   icon: {
     marginRight: 10,
   },
   input: {
     flex: 1,
     height: '100%',
     fontSize: 16,
     // Color dinámico
   },
   errorText: {
     color: 'red',
     fontSize: 13,
     marginBottom: 5,
     marginLeft: 5,
   },
   loginButton: {
     paddingVertical: 15,
     borderRadius: 8,
     marginTop: 30,
     alignItems: 'center',
     justifyContent: 'center',
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 3.84,
   },
   loginButtonDisabled: {
     // No es necesario el backgroundColor aquí, se maneja en el componente
   },
   loginButtonText: {
     color: '#fff',
     fontSize: 18,
     fontWeight: 'bold',
   },
   bottomSpacer: {
     height: 100,
     // Color dinámico
   },
});

export default LoginScreen;