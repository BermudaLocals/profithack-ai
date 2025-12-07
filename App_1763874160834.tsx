// File: native_app/App.tsx
// React Native/Expo Foundation for the Native Mobile App

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

// --- Configuration ---
const { height } = Dimensions.get('window');

// --- Mock Data (Will be replaced by gRPC client call) ---
const MOCK_FEED = [
  { id: 'v1', videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', caption: 'Native App Foundation is Ready!', username: '@profithack_native' },
  { id: 'v2', videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', caption: 'Sub-10ms performance on mobile!', username: '@profithack_speed' },
];

// --- Core Component: FullScreenVideoPlayer ---
const FullScreenVideoPlayer: React.FC<{ video: typeof MOCK_FEED[0] }> = ({ video }) => {
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: video.videoUrl }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />
      {/* Minimalist UI Overlay (Bottom Text) */}
      <View style={styles.overlayBottom}>
        <Text style={styles.username}>{video.username}</Text>
        <Text style={styles.caption}>{video.caption}</Text>
      </View>
      {/* Minimalist UI Overlay (Right Side Bar - Placeholder) */}
      <View style={styles.overlayRight}>
        <Text style={styles.iconText}>❤️</Text>
        <Text style={styles.iconText}>💬</Text>
        <Text style={styles.iconText}>🔗</Text>
      </View>
    </View>
  );
};

// --- Main Component: Native Mobile App Foundation ---
const NativeAppFoundation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Placeholder for the critical vertical swipe logic
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationY, velocityY, state } = event.nativeEvent;
    
    // Simple logic: if swiped fast enough and far enough
    if (state === 5) { // State 5 is GestureHandler.State.END
      if (translationY < -50 && velocityY < -500) {
        // Swiped Up (Next Video)
        setCurrentIndex(prev => (prev + 1) % MOCK_FEED.length);
      } else if (translationY > 50 && velocityY > 500) {
        // Swiped Down (Previous Video)
        setCurrentIndex(prev => (prev - 1 + MOCK_FEED.length) % MOCK_FEED.length);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <View style={styles.container}>
            <FullScreenVideoPlayer video={MOCK_FEED[currentIndex]} />
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    width: '100%',
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 100,
    left: 15,
    zIndex: 10,
    maxWidth: '70%',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  caption: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  overlayRight: {
    position: 'absolute',
    bottom: 100,
    right: 15,
    zIndex: 10,
    alignItems: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 30,
    marginBottom: 20,
  },
});

export default NativeAppFoundation;
