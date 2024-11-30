import React, {useEffect, useState, useCallback, useRef} from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {tls} from "node-forge";

interface Props {
    ip_address: string;
    port: string;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

const VideoStream = ({ip_address, port}:Props) => {
    const [imageData, setImageData] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(true);

    const fetchFrame = useCallback(async () => {
        if (!isRunning) return;

        try {
            const response = await fetch(
                `http://192.168.1.79:8080/frame`,
                {
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'image/jpeg'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch frame');
            }

            // Convert response to base64
            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            // Create the base64 image URL
            const imageUri = `data:image/jpeg;base64,${base64}`;
            setImageData(imageUri);
            setConnectionState('connected');

            // Request next frame
            requestAnimationFrame(fetchFrame);

        } catch (err) {
            if (err instanceof Error) {
                console.error('Fetch error:', err.message);
                setError(err.message);
                setConnectionState('error');
                setTimeout(fetchFrame, 1000);
            }
        }
    }, [ip_address, port, isRunning]);


    useEffect(() => {
        fetchFrame();
        return () => {
            setIsRunning(false);
        };
    }, [fetchFrame]);

    const renderContent = () => {
        switch (connectionState) {
            case 'connecting':
                return (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.statusText}>Connecting to stream...</Text>
                    </View>
                );

            case 'error':
                return (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error || 'Failed to connect'}</Text>
                        <Text style={styles.statusText}>Attempting to reconnect...</Text>
                    </View>
                );

            case 'disconnected':
                return (
                    <View style={styles.centerContainer}>
                        <Text style={styles.statusText}>Stream disconnected</Text>
                        <Text style={styles.statusText}>Reconnecting...</Text>
                    </View>
                );

            case 'connected':
                return imageData ? (
                    <Image
                        source={{ uri: imageData }}
                        style={styles.videoStream}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={styles.statusText}>Waiting for video frames...</Text>
                    </View>
                );

            default:
                return null;
        }
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
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        borderRadius: 10,
        padding: 20,
    },
    videoStream: {
        width: '100%',
        height: '100%',
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