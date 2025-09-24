// components/ProductSelection.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';
import { get3dModels, ProductModel } from '../services/models3dService';
import ProductItem from './ProductItem';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const ACCENT_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];

const ProductSelection = () => {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const navigation = useNavigation();
  const animatedValues = useRef<Animated.Value[]>([]).current;

  const mainTextColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await get3dModels();
        setModels(data);
        animatedValues.length = 0;
        data.forEach(() => {
          animatedValues.push(new Animated.Value(0));
        });
        setIsLoading(false);
        Animated.stagger(
          100,
          animatedValues.map(animation =>
            Animated.timing(animation, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            })
          )
        ).start();
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleProductPress = (model: ProductModel) => {
    Alert.alert("Producto Seleccionado", `Has seleccionado la ${model.product_name}.`);
  };

  const toggleViewMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={mainTextColor} />
        <Text style={[styles.loadingText, { color: mainTextColor }]}>Cargando productos...</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: ProductModel, index: number }) => {
    const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
    
    return (
      <Animated.View
        style={[
          {
            opacity: animatedValues[index],
            transform: [
              {
                translateY: animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
          viewMode === 'list' ? { width: width - 40 } : { width: (width / 2) - 20, marginHorizontal: 10 },
        ]}
      >
        <ProductItem
          item={item}
          viewMode={viewMode}
          onPress={handleProductPress}
          accentColor={accentColor}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <Text style={[styles.title, { color: mainTextColor }]}>Elige un producto</Text>
        <TouchableOpacity onPress={toggleViewMode}>
          <Ionicons
            name={viewMode === 'list' ? 'grid-outline' : 'list'}
            size={30}
            color={mainTextColor}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        key={viewMode}
        data={models}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={viewMode === 'list' ? styles.listContainer : styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start', // Cambio clave para alinear a la izquierda
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
  },
});

export default ProductSelection;