import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface VideoStreamProps {
    ipAddress: string;
    port: string;
    connectBtn: boolean;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

const VideoStream = ({ ipAddress, port, connectBtn }: VideoStreamProps) => {
    const [imageData, setImageData] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [currentIP, setCurrentIP] = useState('');
    const [currentPort, setCurrentPort] = useState('');

    const frameRequestRef = useRef<NodeJS.Timeout>();
    const initialConnectRef = useRef<boolean>(true);

    const fetchFrame = useCallback(async () => {
        if (!isRunning) return;

        try {
            const response = await fetch(
                `http://${currentIP}:${currentPort}/frame`,
                {
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'image/jpeg'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch frame: ${response.status}`);
            }

            // Create an image element to preload the new frame
            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            const imageUri = `data:image/jpeg;base64,${base64}`;

            // Only update the image once it's ready
            setImageData(imageUri);

            if (initialConnectRef.current || connectionState !== 'connected') {
                setConnectionState('connected');
                initialConnectRef.current = false;
            }

            setError(null);

            if (isRunning) {
                frameRequestRef.current = setTimeout(fetchFrame, 10);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            if (isRunning) {
                frameRequestRef.current = setTimeout(fetchFrame, 100);
            }
        }
    }, [isRunning, currentIP, currentPort, connectionState]);

    const handleConnect = useCallback(() => {
        setCurrentIP(ipAddress);
        setCurrentPort(port);
        setIsRunning(true);
        setConnectionState('connecting');
        initialConnectRef.current = true;
    }, [ipAddress, port]);

    const handleDisconnect = useCallback(() => {
        setIsRunning(false);
        setConnectionState('disconnected');
        setError(null);
        setCurrentIP('');
        setCurrentPort('');
        initialConnectRef.current = true;

        if (frameRequestRef.current) {
            clearTimeout(frameRequestRef.current);
        }
    }, []);

    useEffect(() => {
        if (connectBtn) {
            handleConnect();
        }

        if (isRunning && currentIP && currentPort) {
            fetchFrame();
        }

        return () => {
            if (frameRequestRef.current) {
                clearTimeout(frameRequestRef.current);
            }
        };
    }, [connectBtn, isRunning, currentIP, currentPort, fetchFrame, handleConnect]);

    const renderContent = () => {
        return (
            <View style={styles.videoContainer}>
                {imageData && (
                    <Image
                        source={{ uri: imageData }}
                        style={styles.videoStream}
                        resizeMode="contain"
                    />
                )}
                {!imageData && connectionState === 'connecting' && (
                    <View style={[styles.centerContainer, styles.overlay]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.statusText}>Connecting to stream...</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
    },
    videoStream: {
        width: '100%',
        height: '100%',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    statusText: {
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    errorText: {
        color: '#ff4444',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default VideoStream;