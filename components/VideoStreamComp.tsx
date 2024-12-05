import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet, ImageSourcePropType } from 'react-native';

interface VideoStreamProps {
    ipAddress: string;
    port: string;
    connectBtn: boolean;
}

const VideoStream = ({ ipAddress, port, connectBtn }: VideoStreamProps) => {
    const [currentImage, setCurrentImage] = useState<string>();
    const [nextImage, setNextImage] = useState<string>();
    const [isRunning, setIsRunning] = useState(false);
    const frameRequestRef = useRef<number>();
    const isMounted = useRef(true);

    const fetchNextFrame = useCallback(async () => {
        if (!isRunning) return;

        try {
            const response = await fetch(
                `http://${ipAddress}:${port}/frame`,
                {
                    headers: { 'Accept': 'image/jpeg' },
                    cache: 'no-store'
                }
            );

            if (!response.ok || !isMounted.current) return;

            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = () => {
                if (!isMounted.current) return;

                // Swap current and next images
                setCurrentImage(nextImage);
                setNextImage(reader.result as string);

                // Schedule next frame fetch
                frameRequestRef.current = requestAnimationFrame(fetchNextFrame);
            };

            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Frame fetch error:', err);
            if (isRunning && isMounted.current) {
                frameRequestRef.current = requestAnimationFrame(fetchNextFrame);
            }
        }
    }, [isRunning, ipAddress, port, nextImage]);

    useEffect(() => {
        if (connectBtn) {
            setIsRunning(true);
            fetchNextFrame();
        } else {
            setIsRunning(false);
            if (frameRequestRef.current) {
                cancelAnimationFrame(frameRequestRef.current);
            }
        }

        return () => {
            isMounted.current = false;
            if (frameRequestRef.current) {
                cancelAnimationFrame(frameRequestRef.current);
            }
        };
    }, [connectBtn, fetchNextFrame]);

    const imageSource: ImageSourcePropType | undefined = (currentImage || nextImage)
        ? { uri: currentImage || nextImage }
        : undefined;

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                {imageSource && (
                    <Image
                        source={imageSource}
                        style={styles.videoStream}
                        resizeMode="contain"
                    />
                )}
                {!imageSource && (
                    <View style={[styles.centerContainer, styles.overlay]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.statusText}>Connecting...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoStream: {
        width: '100%',
        height: '100%',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    statusText: {
        color: '#fff',
        marginTop: 10,
    }
});

export default VideoStream;