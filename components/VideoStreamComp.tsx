import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';

interface Props {
    ip_address: string;
    port: string;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

const VideoStream = ({ip_address, port}: Props) => {
    const [imageData1, setImageData1] = useState<string | null>(null);
    const [imageData2, setImageData2] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [currentIP, setCurrentIP] = useState('');
    const [currentPort, setCurrentPort] = useState('');
    const [activeBuffer, setActiveBuffer] = useState(1);

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

            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            const imageUri = `data:image/jpeg;base64,${base64}`;
            if (activeBuffer === 1) {
                setImageData2(imageUri);
                setActiveBuffer(2);
            } else {
                setImageData1(imageUri);
                setActiveBuffer(1);
            }
            setConnectionState('connected');
            setError(null);

            requestAnimationFrame(fetchFrame);
        } catch (err) {
            if (err instanceof Error) {
                console.error('Fetch error:', err.message);
                setError(err.message);
                setConnectionState('error');
                if (isRunning) {
                    setTimeout(fetchFrame, 1000);
                }
            }
        }
    }, [isRunning, currentIP, currentPort, activeBuffer]);

    const handleConnect = () => {
        setCurrentIP(ip_address);
        setCurrentPort(port);
        setIsRunning(true);
        setConnectionState('connecting');
    };

    const isValidConnection = useCallback(() => {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ip_address &&
            port &&
            ipRegex.test(ip_address) &&
            !isNaN(Number(port)) &&
            Number(port) > 0 &&
            Number(port) <= 65535;
    }, [ip_address, port]);

    const handleDisconnect = () => {
        setIsRunning(false);
        setConnectionState('disconnected');
        setImageData1(null);
        setImageData2(null);
        setError(null);
        setCurrentIP('');
        setCurrentPort('');
    };

    useEffect(() => {
        if (isRunning && currentIP && currentPort) {
            fetchFrame();
        }
    });

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
                        <Text style={styles.statusText}>Enter IP and port to connect</Text>
                    </View>
                );

            case 'connected':
                return (
                    <View style={styles.videoContainer}>
                        {imageData1 && (
                            <Image
                                source={{ uri: imageData1 }}
                                style={[
                                    styles.videoStream,
                                    { opacity: activeBuffer === 1 ? 1 : 0 }
                                ]}
                                resizeMode="contain"
                            />
                        )}
                        {imageData2 && (
                            <Image
                                source={{ uri: imageData2 }}
                                style={[
                                    styles.videoStream,
                                    { opacity: activeBuffer === 2 ? 1 : 0 },
                                    { position: 'absolute', top: 0, left: 0 }
                                ]}
                                resizeMode="contain"
                            />
                        )}
                        {!imageData1 && !imageData2 && (
                            <View style={styles.centerContainer}>
                                <Text style={styles.statusText}>Waiting for video frames...</Text>
                            </View>
                        )}
                    </View>
                );


            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                {connectionState !== 'connected' ? (
                    <Pressable
                        style={({pressed}) => [
                            styles.button,
                            {backgroundColor: pressed ? '#1873CC' : '#2196F3'},
                            !isValidConnection() && styles.buttonDisabled
                        ]}
                        onPress={handleConnect}
                        disabled={!isValidConnection()}
                    >
                        <Text style={styles.buttonText}>Connect</Text>
                    </Pressable>
                ) : null}
            </View>
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
    videoContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: 10,
    },
    buttonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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