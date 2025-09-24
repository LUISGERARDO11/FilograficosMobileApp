// app/index.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import ProductSelection from '../components/ProductSelection';
import { useThemeColor } from '../hooks/use-theme-color';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

const getInitials = (name: string | undefined): string => {
   if (!name) return '';
   const parts = name.split(' ');
   let initials = '';
   if (parts.length > 0) {
     initials += parts[0][0];
   }
   if (parts.length > 1) {
     initials += parts[parts.length - 1][0];
   }
   return initials.toUpperCase();
};

const APP_VERSION = '1.0.0';

const HomeScreen = () => {
   const { user, signOut } = useAuth();
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const colorScheme = useColorScheme();

   // Ahora todos los colores de fondo del contenedor principal son iguales
   const mainBgColor = useThemeColor({ light: '#002558', dark: '#151718' }, 'background');

   // Se eliminaron las variables de color separadas para unificar el fondo
   const headerTitleColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
   const menuBgColor = useThemeColor({ light: 'white', dark: '#282828' }, 'background');
   const menuHeaderText = useThemeColor({ light: '#002558', dark: '#eee' }, 'text');
   const closeIconColor = useThemeColor({ light: '#002558', dark: '#ccc' }, 'text');
   const userInfoBorderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'tabIconDefault');
   const initialsContainerBg = useThemeColor({ light: '#002558', dark: '#444' }, 'background');
   const initialsTextColor = useThemeColor({ light: 'white', dark: '#eee' }, 'text');
   const userEmailColor = useThemeColor({ light: '#888', dark: '#a0a0a0' }, 'icon');
   const userNameColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
   const helpButtonBg = useThemeColor({ light: '#e9f5ff', dark: '#333' }, 'background');
   const helpTextColor = useThemeColor({ light: '#0056b3', dark: '#fff' }, 'tint');
   const logoutButtonBg = useThemeColor({ light: '#dc3545', dark: '#c82333' }, 'background');
   const logoutTextColor = useThemeColor({ light: 'white', dark: 'white' }, 'text');
   const appVersionColor = useThemeColor({ light: '#888', dark: '#a0a0a0' }, 'icon');

   const toggleMenu = () => {
     setIsMenuOpen(!isMenuOpen);
   };

   const handleHelpPress = () => {
     Linking.openURL('https://ecommerce-filograficos.vercel.app/help');
   };

   return (
     <SafeAreaView style={[styles.safeArea, { backgroundColor: mainBgColor }]}>
       <View style={[styles.container, { backgroundColor: mainBgColor }]}>
         <View style={[styles.header, { backgroundColor: mainBgColor }]}>
           <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
             <Ionicons name="menu" size={32} color={headerTitleColor} />
           </TouchableOpacity>
           <Text style={[styles.headerTitle, { color: headerTitleColor }]}>Selecciona tu producto</Text>
         </View>

         {/* El componente de selección se integra directamente sin contenedor extra */}
         <ProductSelection />
         
         {isMenuOpen && (
           <TouchableOpacity
             style={styles.overlay}
             onPress={toggleMenu}
             activeOpacity={1}
           >
             <View style={[styles.menu, { backgroundColor: menuBgColor }]}>
               <View style={styles.menuContent}>
                 <View style={styles.menuHeader}>
                   <Text style={[styles.menuHeaderText, { color: menuHeaderText }]}>Menú</Text>
                   <TouchableOpacity onPress={toggleMenu}>
                     <Ionicons name="close" size={32} color={closeIconColor} />
                   </TouchableOpacity>
                 </View>

                 <View style={[styles.userInfo, { borderBottomColor: userInfoBorderColor }]}>
                   <View style={styles.profileImageContainer}>
                     {user?.profile_picture_url ? (
                       <Image source={{ uri: user.profile_picture_url }} style={styles.profileImage} />
                     ) : (
                       <View style={[styles.initialsContainer, { backgroundColor: initialsContainerBg }]}>
                         <Text style={[styles.initialsText, { color: initialsTextColor }]}>{getInitials(user?.name)}</Text>
                       </View>
                     )}
                     <View style={styles.activeIndicator} />
                   </View>
                   <Text style={[styles.userEmail, { color: userEmailColor }]}>{user?.email}</Text>
                   <Text style={[styles.userName, { color: userNameColor }]}>{user?.name}</Text>
                 </View>

                 <View style={{ flex: 1 }} />

                 <View style={styles.bottomMenu}>
                   <TouchableOpacity style={[styles.helpButton, { backgroundColor: helpButtonBg }]} onPress={handleHelpPress}>
                     <Ionicons name="help-circle-outline" size={24} color={helpTextColor} />
                     <Text style={[styles.helpText, { color: helpTextColor }]}>Ayuda</Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity style={[styles.logoutButton, { backgroundColor: logoutButtonBg }]} onPress={signOut}>
                     <Ionicons name="log-out-outline" size={24} color={logoutTextColor} />
                     <Text style={[styles.logoutText, { color: logoutTextColor }]}>Cerrar Sesión</Text>
                   </TouchableOpacity>

                   <Text style={[styles.appVersion, { color: appVersionColor }]}>Versión {APP_VERSION}</Text>
                 </View>
               </View>
             </View>
           </TouchableOpacity>
         )}
       </View>
     </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   safeArea: {
     flex: 1,
   },
   container: {
     flex: 1,
   },
   header: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: 15,
     paddingTop: 50,
     elevation: 4,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.2,
     shadowRadius: 2,
   },
   menuButton: {
     paddingRight: 15,
   },
   headerTitle: {
     fontSize: 22,
     fontWeight: 'bold',
   },
   // Se eliminó la separación de la sección de contenido
   // y los bordes redondeados para que el fondo sea uniforme.
   welcomeText: {
     fontSize: 20,
     fontWeight: '600',
     marginBottom: 20,
     textAlign: 'center',
   },
   overlay: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   menu: {
     width: width * 0.7,
     height: '100%',
     padding: 20,
     paddingTop: 50,
   },
   menuContent: {
     flex: 1,
   },
   menuHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 30,
   },
   menuHeaderText: {
     fontSize: 24,
     fontWeight: 'bold',
   },
   userInfo: {
     alignItems: 'center',
     marginBottom: 20,
     borderBottomWidth: 1,
     paddingBottom: 20,
   },
   profileImageContainer: {
     position: 'relative',
     width: 80,
     height: 80,
     borderRadius: 40,
     backgroundColor: '#e0e0e0',
     justifyContent: 'center',
     alignItems: 'center',
   },
   profileImage: {
     width: '100%',
     height: '100%',
     borderRadius: 40,
   },
   initialsContainer: {
     width: '100%',
     height: '100%',
     borderRadius: 40,
     justifyContent: 'center',
     alignItems: 'center',
   },
   initialsText: {
     fontSize: 32,
     fontWeight: 'bold',
   },
   activeIndicator: {
     position: 'absolute',
     bottom: 5,
     right: 5,
     width: 15,
     height: 15,
     borderRadius: 7.5,
     backgroundColor: '#28a745',
     borderWidth: 2,
     borderColor: 'white',
   },
   userEmail: {
     fontSize: 14,
     marginTop: 10,
   },
   userName: {
     fontSize: 18,
     fontWeight: 'bold',
     marginTop: 5,
     textAlign:'center',
   },
   bottomMenu: {
     alignItems: 'center',
   },
   helpButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     width: '100%',
     paddingVertical: 12,
     borderRadius: 8,
     marginBottom: 10,
   },
   helpText: {
     fontSize: 16,
     fontWeight: 'bold',
     marginLeft: 10,
   },
   logoutButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     width: '100%',
     paddingVertical: 15,
     borderRadius: 8,
     elevation: 2,
     shadowColor: '#dc3545',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
     shadowRadius: 3.84,
   },
   logoutText: {
     fontSize: 18,
     fontWeight: 'bold',
     marginLeft: 10,
   },
   appVersion: {
     fontSize: 12,
     marginTop: 15,
     textAlign: 'center',
   },
});

export default HomeScreen;