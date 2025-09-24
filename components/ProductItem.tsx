// components/ProductItem.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';
import { ProductModel } from '../services/models3dService';

interface ProductItemProps {
  item: ProductModel;
  viewMode: 'list' | 'grid';
  onPress: (item: ProductModel) => void;
  accentColor: string;
}

const ProductItem = ({ item, viewMode, onPress, accentColor }: ProductItemProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardBgColor = useThemeColor({ light: '#fff', dark: '#282828' }, 'background');
  const gridItemColor = useThemeColor({ light: '#eee', dark: '#333' }, 'background');
  const iconColor = useThemeColor({ light: '#002558', dark: '#eee' }, 'tint');

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  if (viewMode === 'list') {
    return (
      <Animated.View style={[styles.animatedView, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[styles.listCard, { backgroundColor: cardBgColor }]}
          onPress={() => onPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Image source={{ uri: item.preview_image_url }} style={styles.listImage} />
            <View style={styles.textContainer}>
              <Text style={[styles.productName, { color: accentColor }]}>{item.product_name}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={iconColor} style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  } else { // 'grid' mode
    return (
      <Animated.View style={[styles.animatedView, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: gridItemColor }]}
          onPress={() => onPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.preview_image_url }} style={styles.gridImage} />
          <Text style={[styles.gridText, { color: accentColor }]}>{item.product_name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
};

const styles = StyleSheet.create({
  animatedView: {
    // No definimos ancho aquí, lo hará el componente padre
    marginVertical: 8,
  },
  listCard: {
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  arrowIcon: {
    alignSelf: 'center',
  },
  gridItem: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 5,
  },
  gridText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductItem;