import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, ActivityIndicator, Text, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const WS_URL = 'ws://your-server-ip:port'; // Replace with your WebSocket server address

interface WebSocketMessage extends MessageEvent {
    data: string;
}

interface Props {
    ip_address: string;
    port: string;
}

export default function VideoStreamScreen({ip_address, port}: Props): JSX.Element {
    const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fps, setFps] = useState(0);
    const frameCountRef = React.useRef(0);

    useEffect(() => {
        let ws: WebSocket;
        let fpsInterval: ReturnType<typeof setInterval>;

        const connectWebSocket = () => {
            try {
                ws = new WebSocket(`ws://${ip_address}:${port}`);

                ws.onopen = () => {
                    console.log('WebSocket Connected');
                    setIsLoading(false);
                    setError(null);
                };

                ws.onmessage = (event: WebSocketMessage) => {
                    try {
                        const base64Image = `data:image/jpeg;base64,${event.data}`;
                        setImageSource({ uri: base64Image });
                        frameCountRef.current += 1;
                        setError(null);
                    } catch (err) {
                        const error = err as Error;
                        setError(`Frame processing error: ${error.message}`);
                    }
                };

                ws.onerror = (err) => {
                    console.error('WebSocket error:', err);
                    setError('Connection error');
                    setIsLoading(false);
                };

                ws.onclose = () => {
                    console.log('WebSocket closed, attempting to reconnect...');
                    setTimeout(connectWebSocket, 5000);
                };

            } catch (err) {
                const error = err as Error;
                setError(`Connection error: ${error.message}`);
                setIsLoading(false);
            }
        };

        // Set up FPS counter
        fpsInterval = setInterval(() => {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
        }, 1000);

        connectWebSocket();

        // Cleanup
        return () => {
            if (ws) {
                ws.close();
            }
            clearInterval(fpsInterval);
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : imageSource ? (
                    <>
                        <Image
                            source={imageSource}
                            style={styles.image as ImageStyle}
                            resizeMode="contain"
                        />
                        <Text style={styles.fpsText}>FPS: {fps}</Text>
                    </>
                ) : (
                    <Text style={styles.waitingText}>Waiting for stream...</Text>
                )}
            </View>
        </View>
    );
}

interface Styles {
    container: ViewStyle;
    imageContainer: ViewStyle;
    image: ImageStyle;
    errorText: TextStyle;
    waitingText: TextStyle;
    fpsText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    },
    errorText: {
        color: '#ff0000',
        fontSize: 16,
        textAlign: 'center',
        padding: 20,
    },
    waitingText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    fpsText: {
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 4,
        fontSize: 14,
    }
});