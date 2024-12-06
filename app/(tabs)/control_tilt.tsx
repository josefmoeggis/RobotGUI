import { StyleSheet, View, Text, Vibration, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputExample from "@/components/InputText";
import React, {useEffect, useState} from "react";
import { DeviceMotion } from 'expo-sensors';
import {LiveStreamingView} from "@/components/StreamView";
import {wsClient} from "@/components/WSconnection";
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface RotationData {
    beta: number | null;
}

export default function TabThreeScreen() {
    const [ipAddress, setIpAddress] = useState('');
    const [isDriving, setIsDriving] = useState(false)
    const [isReversing, setIsReversing] = useState(false)
    const [port, setPort] = useState('')
    const [port_comm, setPortComm] = useState('');
    const [button, setButton] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [speed, setSpeed] = useState(0);
    const progress = useSharedValue(100);
    const min = useSharedValue(0);
    const max = useSharedValue(255);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [data, setData] = useState<RotationData>({
        beta: null
    });
    const [subscription, setSubscription] = useState<any>(null);

    const _slow = () => DeviceMotion.setUpdateInterval(100);
    const _fast = () => DeviceMotion.setUpdateInterval(16);

    const _subscribe = async () => {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access device motion was denied');
            return;
        }
        const sub = DeviceMotion.addListener(motionData => {
            if (motionData?.rotation) {
                setData({ beta: motionData.rotation.beta });
            }
        });
        setSubscription(sub);
    };

    const _unsubscribe = () => {
        subscription?.remove();
        setSubscription(null);
    };

    useEffect(() => {
        let mounted = true;
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds

        async function connectToServer() {
            if (isConnected && port_comm) {
                try {
                    setConnectionStatus('connecting');
                    await wsClient.connect(ipAddress, port_comm);
                    if (!mounted) return;
                    setConnectionStatus('connected');
                    retryCount = 0; // Reset retry count on successful connection
                } catch (error) {
                    if (!mounted) return;
                    console.error('Failed to connect:', error);

                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
                        setTimeout(connectToServer, retryDelay);
                    } else {
                        setIsConnected(false);
                        setConnectionStatus('disconnected');
                        console.log('Max retries reached, connection failed');
                    }
                }
            }
        }

        connectToServer();

        return () => {
            mounted = false;
            wsClient.disconnect();
        };
    }, [isConnected, ipAddress, port_comm]);

    const animatedSpeed = useDerivedValue(() => {
        return isDriving ? progress.value :
            isReversing ? -progress.value : 0;
    });

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    // In your TabThreeScreen component:
    useEffect(() => {
        let mounted = true;

        async function connectToServer() {
            if (isConnected && port_comm) {
                try {
                    await wsClient.connect(ipAddress, port_comm);
                    if (!mounted) return;
                    // Optional: Add visual feedback that connection is successful
                } catch (error) {
                    if (!mounted) return;
                    console.error('Failed to connect:', error);
                    setIsConnected(false);
                    // Optional: Add visual feedback for connection failure
                }
            }
        }

        connectToServer();

        return () => {
            mounted = false;
            wsClient.disconnect();
        };
    }, [isConnected, ipAddress, port_comm]);

    useEffect(() => {
        if (data.beta !== null && connectionStatus === 'connected') {
            const betaValue = data.beta;
            const intervalId = setInterval(() => {
                try {
                    if (wsClient.isConnected()) {
                        wsClient.sendBetaValue(betaValue * 180/Math.PI);
                    }
                } catch (error) {
                    console.error('Error sending beta value:', error);
                    setConnectionStatus('disconnected');
                    setIsConnected(false);
                }
            }, 33);

            return () => clearInterval(intervalId);
        }
    }, [data.beta, connectionStatus]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (wsClient.isConnected()) {
                // Use .value here since we're in an effect, not during render
                wsClient.sendSpeedValue(animatedSpeed.value);
            }
        }, 33);
        return () => clearInterval(intervalId);
    }, [animatedSpeed]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInputExample placeholderText={'IP address'} value={ipAddress} onChangeValue={setIpAddress} />
                <TextInputExample placeholderText={'Cam port'} value={port} onChangeValue={(newPort) => { setPort(newPort); console.log('IP:', ipAddress, 'Port:', newPort); }} />
            </View>
            <View style={styles.inputCom}>
                <TextInputExample placeholderText={'WS port'} value={port_comm} onChangeValue={setPortComm} />
            </View>
            <View style={styles.buttonRight}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#1873CC' : '#2196F3' }
                    ]}
                    onPressIn={() => {
                        setIsDriving(true);
                        Vibration.vibrate(95);
                    }}
                    onPressOut={() => setIsDriving(false)}
                >
                    <Text style={styles.buttonText}>DRIVE</Text>
                </Pressable>
            </View>

            <View style={styles.buttonLeft}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#811f1f' : '#d87e7e' }
                    ]}
                    onPressIn={() => {
                        setIsReversing(true);
                        Vibration.vibrate(95);
                    }}
                    onPressOut={() => setIsReversing(false)}
                >
                    <Text style={styles.buttonText}>REVERSE</Text>
                </Pressable>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Control Robot with Tilt</Text>
                <View style={styles.videoContainer}>
                    <LiveStreamingView ipAddress={ipAddress} port={port} connectBtn={button}/>
                </View>
            </View>
            <View style={styles.buttonConnectOuter}>
                <Pressable
                    style={({pressed}) => [
                        styles.buttonConnect,
                        {
                            backgroundColor:
                                connectionStatus === 'connected' ? '#118c05' :
                                    connectionStatus === 'connecting' ? '#FFA500' :
                                        (pressed ? '#1873CC' : '#2196F3'),
                            opacity: connectionStatus === 'connected' ? 0.7 : 1
                        },
                    ]}
                    onPress={() => {
                        if (connectionStatus === 'disconnected') {
                            setButton(true);
                            setIsConnected(true);
                        }
                    }}
                    disabled={connectionStatus !== 'disconnected'}
                >
                    <Text style={styles.buttonText}>
                        {connectionStatus === 'connected' ? 'Connected' :
                            connectionStatus === 'connecting' ? 'Connecting...' :
                                'Connect'}
                    </Text>
                </Pressable>
            </View>
            <View>
                <Slider
                    style={styles.slider}
                    progress={progress}
                    minimumValue={min}
                    maximumValue={max}
                    onValueChange={(value) => {
                        progress.value = value;
                        Vibration.vibrate(10);
                    }}
                    theme={{
                        disableMinTrackTintColor: '#fff',
                        maximumTrackTintColor: '#fff',
                        minimumTrackTintColor: '#811f1f',
                        cacheTrackTintColor: '#333',
                        bubbleBackgroundColor: '#666',
                        heartbeatColor: '#999',
                    }}
                    sliderHeight={8}
                />
                <Text style={styles.speed}>Speed</Text>
            </View>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dde7ff',
    },
    inputContainer: {
        position: 'absolute',
        top: '15%',
        left: '5%',
        zIndex: 1,
    },
    inputCom: {
        position: 'absolute',
        top: '15%',
        right: '5%',
        zIndex: 1,
        height: '10%',
        width: '15%',
    },
    buttonConnectOuter: {
        display: 'flex',
        position: 'absolute',
        height: '12%',
        width: '12%',
        borderRadius: '5%',
        top: '35%',
        right: '6.5%',
    },
    buttonConnect: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    sliderContainer: {
        position: 'absolute',
        top: '30%',
        width: '90%',
        alignSelf: 'center',
    },
    slider: {
        width: '20%',
        height: 50,
        left: 100,
        top: 75,
        transform: [{ rotate: '-90deg' }]
    },
    buttonRight: {
        display: 'flex',
        position: 'absolute',
        top: '85%',
        right: '2%',
        height: '30%',
        width: '47%',
        borderRadius: '5%',
    },
    buttonLeft: {
        display: 'flex',
        position: 'absolute',
        top: '85%',
        left: '2%',
        height: '30%',
        width: '47%',
        borderRadius: '5%',
    },
    button: {
        height: '100%',
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        position: 'absolute',
        width: '50%',
        height: '75%',
        alignSelf: 'center',
        marginTop: 1,
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: '1%',
    },
    videoContainer: {
        height: '90%',
        backgroundColor: '#000',
        borderRadius: 10,
    },
    speed: {
        height: 20,
        top: 60,
        left: 180,
        width:60,
        color: '#271563',
        transform: [{rotate: '-90deg'}],
        fontWeight: '900'
    }
});