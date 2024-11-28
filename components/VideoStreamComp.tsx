import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {tls} from "node-forge";

interface Props {
    ip_address: string;
    port: string;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

const VideoStream = ({ip_address, port}:Props) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [error, setError] = useState<string | null>(null);

    const connectWebSocket = useCallback(() => {
        setConnectionState('connecting');
        setError(null);

        const ws = new WebSocket(ip_address && port ? `ws://${ip_address}:${port}`: `ws://someurl.com:5000`);

        ws.onopen = () => {
            setConnectionState('connected');
            setError(null);
        };

        ws.onmessage = (msg) => {
            const blob = new Blob([msg.data], { type: 'image/jpeg' });
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setImageUrl(result);
                }
            };

            reader.onerror = () => {
                setError('Failed to read video frame');
            };

            reader.readAsDataURL(blob);
        };

        ws.onerror = (err) => {
            setError('Connection error occurred');
            setConnectionState('error');
        };

        ws.onclose = () => {
            setConnectionState('disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };

        return ws;
    }, []);

    useEffect(() => {
        const ws = connectWebSocket();
        return () => {
            ws.close();
        };
    }, [connectWebSocket]);

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
                return imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
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