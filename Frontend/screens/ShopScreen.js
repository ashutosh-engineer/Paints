import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlipkartLoader from '../components/FlipkartLoader';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import { HomeIcon, ShoppingCartIcon, SearchIcon, XIcon, ShoppingBagIcon, ArrowLeftIcon } from '../components/ProfessionalIcons';
import { addToCart } from '../services/cartApi';

const { width } = Dimensions.get('window');


// Hardcoded All-wood Series products with Supabase image URLs
const ALLWOOD_SERIES_PRODUCTS = [
  {
    id: 'allwood-1',
    name: 'Allwood 1k Finish (Soft Touch)',
    description: 'Premium 1K finish with soft touch for wood surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/04df5763-30b8-4daa-9eec-075c7c0cbb70.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Soft Touch',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-2',
    name: 'Melamine (Premium Finish)',
    description: 'Premium melamine finish for durable wood coating',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/0ed58c94-c96c-456a-a90d-598854333aad.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Premium',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-3',
    name: 'PU Luxury Finish',
    description: 'Polyurethane luxury finish for premium wood protection',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/1644e53a-db6f-4703-ba90-44b429b20a88.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Luxury',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-4',
    name: 'Opus Wood Filler Grain and Dent Filler',
    description: 'Professional wood filler for grain and dent filling',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/3a332493-e06d-4533-85d9-a2ca0c84f3e8.jpg',
    series: 'All-wood Series',
    size: '500g',
    finish: 'Filler',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-5',
    name: 'Opus PU Thinner Luxury Thinner',
    description: 'Premium PU thinner for luxury finishes',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/4d346365-8f27-4a8f-aa26-ad9eccdbd2b9.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Thinner',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-6',
    name: 'Opus Allwood Sanding Sealer',
    description: 'Professional sanding sealer for wood preparation',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/7b13e895-7cdf-44a3-8f07-98142fe19fc0.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Sealer',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-7',
    name: 'Opus Allwood PU Luxury Finish',
    description: 'Premium polyurethane luxury finish coating',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/85249a45-e3ef-4b7c-8707-be0c7ec05a9f.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Luxury',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-8',
    name: 'Opus Allwood Wood Stain',
    description: 'Professional wood stain for natural wood enhancement',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/8e25017b-04ab-4aad-a78d-b6d1b7206020.jpg',
    series: 'All-wood Series',
    size: '500ml',
    finish: 'Stain',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-9',
    name: 'Opus Allwood Melamine',
    description: 'Premium melamine coating for wood surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f223e03d-3bf5-4ec8-9cf3-82315819a0bf.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Melamine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'allwood-10',
    name: 'Opus Allwood Italian PU',
    description: 'Italian polyurethane finish for premium wood coating',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f4adb8de-61f4-4c18-8026-a384eb63055b.jpg',
    series: 'All-wood Series',
    size: '1L',
    finish: 'Italian PU',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

// Hardcoded Alldry Series Waterproof products with Supabase image URLs
const ALLDRY_SERIES_PRODUCTS = [
  {
    id: 'alldry-1',
    name: 'Opus Alldry Wall in Proof',
    description: 'Premium waterproofing solution for walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/4392d790-2ac7-4266-9708-79a158ead022.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Waterproof',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-2',
    name: 'Opus Total 2K',
    description: 'Two-component waterproofing system',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/64a5b3f8-5122-4a28-8a26-67cb822cb0e8.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Waterproof',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-3',
    name: 'Opus Alldry Total 2K Flex',
    description: 'Flexible two-component waterproofing solution',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/a996487c-8456-4195-8e7c-4b04087d7f14.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Flex',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-4',
    name: 'Opus Alldry Wall Flex',
    description: 'Flexible waterproofing for wall protection',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/bd2baa44-0747-4029-99e3-35445a865114.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Flex',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-5',
    name: 'Opus Alldry Crack Flex Master',
    description: 'Advanced crack repair and waterproofing solution',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/df331e8e-b797-40c8-a611-dd8bbc80702b.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Flex Master',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-6',
    name: 'Opus Alldry Wall in Proof',
    description: 'Premium waterproofing solution for walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/e794d3a1-3256-48ed-bb2c-5f61cb14fabc.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Waterproof',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-7',
    name: 'Opus Alldry Salt Seal',
    description: 'Salt protection and waterproofing solution',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/f3d8393e-bed1-4069-8cf0-607d3a1063c1.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Salt Seal',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'alldry-8',
    name: 'Opus Alldry Repair Master',
    description: 'Complete repair and waterproofing master solution',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/fe496552-79dd-4f8d-88d1-5ae2d6c8293a.jpg',
    series: 'Alldry Series',
    size: '1L',
    finish: 'Repair Master',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const CALISTA_SERIES_PRODUCTS = [
  {
    id: 'calista-1',
    name: 'Calista Perfect Choice Premier',
    description: 'Premium exterior paint from Calista series for perfect finishing',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/010cc20d-7a34-4f43-bf79-9bd5ff52ec05.jpg',
    series: 'Calista Series Exterior',
    size: '1L',
    finish: 'Premium',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'calista-2',
    name: 'Calista Neo Star',
    description: 'High-quality exterior paint with neo star finish',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/4f56b779-0dd3-4378-acd7-6cf7c3081511.jpg',
    series: 'Calista Series Exterior',
    size: '1L',
    finish: 'Neo Star',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'calista-3',
    name: 'Neo Floor Shade',
    description: 'Specialized floor shade paint for exterior surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/6b624d4d-2860-442b-9fc6-6eb69b9fea31.jpg',
    series: 'Calista Series Exterior',
    size: '1L',
    finish: 'Floor Shade',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'calista-4',
    name: 'Calista Neo Tile Shade',
    description: 'Tile shade finish for exterior walls and surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/9760acbb-c35a-4f97-a22f-1df130b263cb.jpg',
    series: 'Calista Series Exterior',
    size: '1L',
    finish: 'Tile Shade',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'calista-5',
    name: 'Calista NEO Star Shine',
    description: 'Premium shine finish for exterior applications',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/cd55aa28-79a1-423c-a527-0f6bf6e04fb5.jpg',
    series: 'Calista Series Exterior',
    size: '1L',
    finish: 'Star Shine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_INTERIOR_SERIES_PRODUCTS = [
  {
    id: 'opus-interior-1',
    name: 'Calista Ever Wash Shine',
    description: 'Premium washable interior paint with shine finish',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/184a9fab-cc56-44a4-980a-9df0b3de7758.jpg',
    series: 'Opus Interior Series',
    size: '1L',
    finish: 'Ever Wash Shine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-interior-2',
    name: 'Calista Ever Stay',
    description: 'Long-lasting interior paint with superior coverage',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/505364e9-f31d-46c8-a0da-962d3795bfe4.jpg',
    series: 'Opus Interior Series',
    size: '1L',
    finish: 'Ever Stay',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-interior-3',
    name: 'Calista Ever Wash',
    description: 'Easy to clean washable interior paint',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/996d9988-34ab-49ae-a1d4-987c7f17b990.jpg',
    series: 'Opus Interior Series',
    size: '1L',
    finish: 'Ever Wash',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-interior-4',
    name: 'Calista Ever Clear Matt',
    description: 'Premium matt finish interior paint with clear coverage',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/9e9ae34d-ae96-4596-a23a-1b95e9ff926c.jpg',
    series: 'Opus Interior Series',
    size: '1L',
    finish: 'Ever Clear Matt',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-interior-5',
    name: 'Calista Ever Clear',
    description: 'Crystal clear finish for interior walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/f619cd21-3e43-4f49-9222-d65d18b8a1b2.jpg',
    series: 'Opus Interior Series',
    size: '1L',
    finish: 'Ever Clear',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_ONE_INTERIOR_PRODUCTS = [
  {
    id: 'opus-one-interior-1',
    name: 'Opus One Pure Legend',
    description: 'Premium legendary finish for interior walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20interior/04aebd31-5467-41c4-86e3-3ae1fcb6ae6f.jpg',
    series: 'Opus One Interior',
    size: '1L',
    finish: 'Pure Legend',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-interior-2',
    name: 'One Pure Elegance',
    description: 'Elegant finish for sophisticated interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20interior/35d59de7-0680-4fd9-a008-040317468d18.jpg',
    series: 'Opus One Interior',
    size: '1L',
    finish: 'Pure Elegance',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_ONE_SERIES_INTERIOR_PRODUCTS = [
  {
    id: 'opus-one-series-int-1',
    name: 'One Pure Elegance Shine',
    description: 'Premium shine finish with pure elegance',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/3e7f7ef0-068c-4213-8d84-a9a18ba4edf8.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Pure Elegance Shine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-2',
    name: 'One Dream Duracoat',
    description: 'Durable coating with dream finish',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/5defe0fe-6a95-45e0-80d1-ec8ab9dfd77a.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Dream Duracoat',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-3',
    name: 'One Timeless Stone',
    description: 'Timeless stone finish for elegant interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/6a0fdfc4-e823-42cb-b49a-897b52f9529e.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Timeless Stone',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-4',
    name: 'One Dream Effects',
    description: 'Special effect finish for dream interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/77737ed9-7d2c-4d04-a35a-f3bc41266245.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Dream Effects',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-5',
    name: 'One Timeless Marmorino',
    description: 'Classic marmorino finish for timeless beauty',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/8f3f52a2-3866-49e8-b954-2010fdb40c24.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Timeless Marmorino',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-6',
    name: 'One Dream Effects Metallic',
    description: 'Metallic dream effects for stunning walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/93992534-8293-4b0b-a6ba-3fc99f765eb5.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Dream Effects Metallic',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-7',
    name: 'One Dream Marble',
    description: 'Luxurious marble finish effect',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/97eb3b68-f594-42bf-8f38-5693d92f0353.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Dream Marble',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-8',
    name: 'One Timeless Natura',
    description: 'Natural timeless finish for organic look',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/9d94ccae-02fa-4c7d-9694-0ec0449e4af0.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Timeless Natura',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-9',
    name: 'One Dream Texture',
    description: 'Textured finish with dream quality',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/a2041046-0cbc-44ba-aa9a-eb0bd27b6aa5.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Dream Texture',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-10',
    name: 'One Timeless Clay',
    description: 'Timeless clay finish for natural elegance',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/aaa12240-9d7c-4225-a8dc-fa3f4f099d88.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Timeless Clay',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-11',
    name: 'One Timeless Marmorino Metallic',
    description: 'Metallic marmorino finish for luxurious look',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/ac5ab0a5-c5b2-4842-9502-078456fd3784.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Timeless Marmorino Metallic',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-int-12',
    name: 'One Pro Smooth Premiere',
    description: 'Professional smooth premiere finish',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/eedc1124-c2ba-4aa7-94ab-71a62bc1ef8c.jpg',
    series: 'Opus One Series Interior',
    size: '1L',
    finish: 'Pro Smooth Premiere',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_ONE_SERIES_EXTERIOR_PRODUCTS = [
  {
    id: 'opus-one-series-ext-1',
    name: 'One True Look',
    description: 'Premium exterior finish with true color appearance',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/eedc1124-c2ba-4aa7-94ab-71a62bc1ef8c.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'True Look',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-2',
    name: 'One True Flex',
    description: 'Flexible exterior coating for weather resistance',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/601502a7-5428-43e0-baa4-ca137a37ef90.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'True Flex',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-3',
    name: 'One Explore Roller',
    description: 'Smooth roller application for exterior surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/657d361a-3e75-423a-b79b-44cffe5d45b4.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'Explore Roller',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-4',
    name: 'One Explore 15',
    description: '15-year durability exterior paint',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/6bda1180-c9a4-4327-9b8f-f872c25139da.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'Explore 15',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-5',
    name: 'One True Vision',
    description: 'Clear vision exterior finish with enhanced clarity',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/8ded96c1-7be9-4388-8f66-c5a76cf2108b.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'True Vision',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-6',
    name: 'One True Life',
    description: 'Long-lasting exterior paint for true protection',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/9390b253-b389-4be9-8420-d27c0ac1b281.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'True Life',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-one-series-ext-7',
    name: 'One Inspire Clear Coat',
    description: 'Inspiring clear coat finish for exterior walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/d14c5101-4540-44e9-a9fe-96fcb3d3c014.jpg',
    series: 'Opus One Series Exterior',
    size: '1L',
    finish: 'Inspire Clear Coat',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_STYLE_SERIES_INTERIOR_PRODUCTS = [
  {
    id: 'opus-style-int-1',
    name: 'Opus Power Bright Shine',
    description: 'Powerful bright shine finish for interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/0bb59105-4fe5-49d7-ad6d-1416f59057cd.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Power Bright Shine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-2',
    name: 'Opus Style Color Smart',
    description: 'Smart color technology for interior walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/0db34cdf-05e6-4c4d-a033-2c8c3ee892b8.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Color Smart',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-3',
    name: 'Opus Style Super Smooth',
    description: 'Super smooth finish for flawless walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/36a482c4-6fdc-4746-8f0c-e6d3c1e6ff9f.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Super Smooth',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-4',
    name: 'Style Power Fit',
    description: 'Perfect fit finish with power coverage',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/58f9cae3-a27a-4075-9064-01c9433bb90b.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Power Fit',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-5',
    name: 'Style Pro Hide Premiere',
    description: 'Professional hiding power premiere finish',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/8478c6fc-c86b-45a3-a59b-5acc22c1828b.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Pro Hide Premiere',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-6',
    name: 'Style Perfect Smart Premiere',
    description: 'Perfect smart premiere finish for modern interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/89d4068a-b0ef-46dc-b8bb-838566d84d5c.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Perfect Smart Premiere',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-7',
    name: 'Style Color Fresh',
    description: 'Fresh color finish with lasting vibrancy',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/b5d0ec34-be47-4e4f-a9cb-8c03701eab67.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Color Fresh',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-8',
    name: 'Opus Style Power Bright',
    description: 'Power bright finish for stunning interiors',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/de8261c0-c556-4b00-8728-4cf879c13ef5.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Power Bright',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-9',
    name: 'Opus Style Color Smart Shine',
    description: 'Smart shine with advanced color technology',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/ecb6d2e7-1394-410f-b5fb-e282a25b9bf0.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Color Smart Shine',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-int-10',
    name: 'Opus Style Super Bright',
    description: 'Super bright finish for luminous walls',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/fe6ac6c5-1407-43ef-baca-938d987b3478.jpg',
    series: 'Opus Style Series Interior',
    size: '1L',
    finish: 'Super Bright',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

const OPUS_STYLE_SERIES_OIL_PAINT_PRODUCTS = [
  {
    id: 'opus-style-oil-1',
    name: 'Opus Style Pro Hide Cement ST Primer',
    description: 'Professional cement primer for superior adhesion',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/953f5e52-9f22-4b6a-911d-7330920259df.jpg',
    series: 'Opus Style Series Oil Paint',
    size: '1L',
    finish: 'Pro Hide Cement ST Primer',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-oil-2',
    name: 'Opus Style Cover Max Red Oxide Primer',
    description: 'Maximum coverage red oxide primer for metal surfaces',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/a693aa11-d1a9-417c-9d80-b31ca5766bba.jpg',
    series: 'Opus Style Series Oil Paint',
    size: '1L',
    finish: 'Cover Max Red Oxide Primer',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  },
  {
    id: 'opus-style-oil-3',
    name: 'Opus Style Cover Max Gloss Enamel',
    description: 'High gloss enamel with maximum coverage',
    image_path: 'https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/fe81774e-bda8-470d-9dff-0bddc4165e1d.jpg',
    series: 'Opus Style Series Oil Paint',
    size: '1L',
    finish: 'Cover Max Gloss Enamel',
    stock: 100,
    price: 0,
    discount_percent: 0,
    isHardcoded: true
  }
];

export default function ShopScreen({ navigation, route }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all'); // all, price_low, price_high, discount
  const [selectedSeries, setSelectedSeries] = useState(route?.params?.selectedSeries || null);
  const [cartCount, setCartCount] = useState(0);

  // Paint series for filtering
  const paintSeries = [
    'All-wood Series',
    'alldry series waterproof',
    'calista series exterior',
    'opus interior series',
    'opus one interior',
    'opus one series exterior',
    'opus one series interior',
    'opus style series interior',
    'opus style series oil paint',
  ];

  useEffect(() => {
    loadData();
    loadCartCount();
  }, []);

  // Set initial series from route params
  useEffect(() => {
    if (route?.params?.selectedSeries) {
      setSelectedSeries(route.params.selectedSeries);
    }
  }, [route?.params?.selectedSeries]);

  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, searchQuery, sortBy, selectedSeries, products]);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      // Load categories
      const catResponse = await fetch(`${API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (catResponse.ok) {
        const catData = await catResponse.json();
        setCategories(catData);
      }

      // Load all products
      const prodResponse = await fetch(`${API_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (prodResponse.ok) {
        const prodData = await prodResponse.json();
        setProducts(prodData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/cart`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const items = await res.json();
        setCartCount(items.length);
        return;
      }
    } catch (error) {
      console.error('Error loading cart count (server):', error);
    }
    // Fallback to local cart
    try {
      const cartStr = await AsyncStorage.getItem('cart');
      const cart = cartStr ? JSON.parse(cartStr) : [];
      setCartCount(cart.length);
    } catch (e) {}
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // For All-wood and All-dry series, use database products if available, otherwise fallback to hardcoded
    if (selectedSeries && selectedSeries.toLowerCase() === 'all-wood series') {
      const dbProducts = products.filter(p => p.category?.name === 'All-wood Series');
      filtered = dbProducts.length > 0 ? dbProducts : [...ALLWOOD_SERIES_PRODUCTS];
    } 
    else if (selectedSeries && selectedSeries.toLowerCase() === 'alldry series waterproof') {
      const dbProducts = products.filter(p => p.category?.name === 'All-dry Series');
      filtered = dbProducts.length > 0 ? dbProducts : [...ALLDRY_SERIES_PRODUCTS];
    } 
    // Add hardcoded Calista Series products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'calista series exterior') {
      filtered = [...CALISTA_SERIES_PRODUCTS];
    } 
    // Add hardcoded Opus Interior Series products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus interior series') {
      filtered = [...OPUS_INTERIOR_SERIES_PRODUCTS];
    } 
    // Add hardcoded Opus One Interior products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus one interior') {
      filtered = [...OPUS_ONE_INTERIOR_PRODUCTS];
    } 
    // Add hardcoded Opus One Series Interior products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus one series interior') {
      filtered = [...OPUS_ONE_SERIES_INTERIOR_PRODUCTS];
    } 
    // Add hardcoded Opus One Series Exterior products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus one series exterior') {
      filtered = [...OPUS_ONE_SERIES_EXTERIOR_PRODUCTS];
    } 
    // Add hardcoded Opus Style Series Interior products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus style series interior') {
      filtered = [...OPUS_STYLE_SERIES_INTERIOR_PRODUCTS];
    } 
    // Add hardcoded Opus Style Series Oil Paint products if that series is selected
    else if (selectedSeries && selectedSeries.toLowerCase() === 'opus style series oil paint') {
      filtered = [...OPUS_STYLE_SERIES_OIL_PAINT_PRODUCTS];
    } 
    else {
      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category_id === selectedCategory.id);
      }

      // Filter by paint series
      if (selectedSeries) {
        filtered = filtered.filter(p => {
          const productName = p.name.toLowerCase();
          const seriesName = selectedSeries.toLowerCase();
          // Check if product name or description contains the series name
          return productName.includes(seriesName) || 
                 (p.description && p.description.toLowerCase().includes(seriesName));
        });
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => {
          const priceA = a.price * (1 - (a.discount_percent || 0) / 100);
          const priceB = b.price * (1 - (b.discount_percent || 0) / 100);
          return priceA - priceB;
        });
        break;
      case 'price_high':
        filtered.sort((a, b) => {
          const priceA = a.price * (1 - (a.discount_percent || 0) / 100);
          const priceB = b.price * (1 - (b.discount_percent || 0) / 100);
          return priceB - priceA;
        });
        break;
      case 'discount':
        filtered = filtered.filter(p => p.discount_percent > 0);
        filtered.sort((a, b) => b.discount_percent - a.discount_percent);
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product) => {
    try {
      if (typeof product.id === 'number') {
        await addToCart(product.id, 1);
        Alert.alert('Success', `${product.name} added to cart!`);
      } else {
        // Fallback for hardcoded products
        const cartStr = await AsyncStorage.getItem('cart');
        let cart = cartStr ? JSON.parse(cartStr) : [];
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex >= 0) {
          cart[existingIndex].quantity += 1;
        } else {
          cart.push({ ...product, quantity: 1, selectedSize: '1L' });
        }
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
        Alert.alert('Success', `${product.name} added to cart!`);
      }
      loadCartCount(); // Refresh cart count
    } catch (error) {
      console.error('Add to cart error:', error);
      // If it's a database product error, show helpful message
      if (typeof product.id === 'number') {
        Alert.alert('Error', 'This product is currently unavailable. Please try other products.');
      } else {
        Alert.alert('Error', error.message || 'Failed to add to cart');
      }
    }
  };

  const renderProduct = ({ item }) => {
    const hasDiscount = item.discount_percent > 0;
    const discountedPrice = hasDiscount 
      ? item.price * (1 - item.discount_percent / 100)
      : item.price;

    // Use image_path if it's a full URL (starts with http), otherwise prepend API_URL
    const imageUrl = item.image_path && item.image_path.startsWith('http') 
      ? item.image_path 
      : `${API_URL}${item.image_path || item.image_url || ''}`;

    // Check if this is a hardcoded product
    const isHardcodedProduct = item.isHardcoded === true;

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          {false && hasDiscount && !isHardcodedProduct && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount_percent}% OFF</Text>
            </View>
          )}
          <Image 
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {!isHardcodedProduct && item.stock < 10 && item.stock > 0 && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Only {item.stock} left</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productDetails}>
          <Text style={styles.productBrand}>Birla Opus</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          {/* Hide rating and price for hardcoded products */}
          {false && !isHardcodedProduct && (
            <>
              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>4.3 ★</Text>
                </View>
                <Text style={styles.ratingCount}>(234)</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>₹{discountedPrice.toFixed(0)}</Text>
                {hasDiscount && (
                  <>
                    <Text style={styles.originalPrice}>₹{item.price.toFixed(0)}</Text>
                    <Text style={styles.discountPercentage}>{item.discount_percent}% off</Text>
                  </>
                )}
              </View>

              <Text style={styles.deliveryText}>Free delivery</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
};

if (loading) {
  return (
    <View style={[styles.container, styles.centerContent]}>
      <FlipkartLoader size={60} />
    </View>
  );
}

  return (
    <View style={styles.container}>
      {/* Flipkart-style Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => {/* Focus search */}}
          >
            <SearchIcon size={20} color="#717478" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for Paint Products"
              placeholderTextColor="#717478"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <XIcon size={18} color="#717478" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cartIcon}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCartIcon size={24} color="#ffffff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Paint Series Filter - Flipkart Style */}
      <View style={styles.filtersBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {paintSeries.map((series, index) => (
            <TouchableOpacity
              key={`series-${index}`}
              style={[
                styles.filterChip,
                selectedSeries === series && styles.filterChipActive
              ]}
              onPress={() => setSelectedSeries(series)}
            >
              <Text style={[
                styles.filterText,
                selectedSeries === series && styles.filterTextActive
              ]}>
                {series}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid - Flipkart Style */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBagIcon size={80} color="#d3d3d3" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "Products will appear here"
              }
            </Text>
            {(selectedCategory || selectedSeries || searchQuery || sortBy !== 'all') && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedSeries(null);
                  setSearchQuery('');
                  setSortBy('all');
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  // Header Styles - Flipkart Blue
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    padding: 0,
  },
  cartIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6161',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Filters Bar - Flipkart Style
  filtersBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  filtersContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#2874f0',
    borderColor: '#2874f0',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Categories Container
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#e7f3ff',
    borderColor: '#2874f0',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#878787',
  },
  categoryChipTextActive: {
    color: '#2874f0',
    fontWeight: '600',
  },
  // Paint Series Container
  seriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  seriesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  seriesContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  seriesChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  seriesChipActive: {
    backgroundColor: '#2874f0',
    borderColor: '#2874f0',
  },
  seriesChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#878787',
  },
  seriesChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Product List
  productList: {
    padding: 6,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  // Product Card - Flipkart Style
  productCard: {
    width: (width - 36) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#fafafa',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#388e3c',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    zIndex: 1,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    padding: 12,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: '500',
    color: '#878787',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
    lineHeight: 18,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingBadge: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  ratingCount: {
    fontSize: 11,
    color: '#878787',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '400',
    color: '#878787',
    textDecorationLine: 'line-through',
  },
  discountPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#388e3c',
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#388e3c',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#878787',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#2874f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
