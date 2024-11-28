import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as ScreenOrientation from 'expo-screen-orientation'
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarPosition: 'top',
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
            ios: {
                position: 'absolute',
                height: 40,
            },
            android: {
                height: '15%',
            },
        }),
          tabBarIconStyle: {
              height: 40,
              marginTop: '-12%', // Reset any margin
          },
          tabBarLabelStyle: {
              fontSize: 15,
              marginTop: '-12%', // Reset any margin
          },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Gyroscope',
          tabBarIcon: ({ color }) => <MaterialIcons name="screen-rotation" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
          name="control_tilt"
          options={{
              title: 'Drive Robot',
              tabBarIcon: ({ color }) => <MaterialCommunityIcons name="car-lifted-pickup" size={24} color={color} />,
          }}
      />
    </Tabs>
  );
}
