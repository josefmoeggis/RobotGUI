import { StyleSheet, View, Text, Vibration, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputExample from "@/components/InputText";
import React, {useEffect, useState} from "react";
import { DeviceMotion } from 'expo-sensors';
import {LiveStreamingView} from "@/components/StreamView";
import VerticalSlider from "@/components/Sliders";
import {wsClient} from "@/components/WSconnection";
import slider from "@react-native-community/slider/src/Slider";

interface RotationData {
    beta: number | null;
}

export default function TabThreeScreen() {
    const [sliderValue, setSliderValue] = useState(30);
    const [ipAddress, setIpAddress] = useState('');
    const [port, setPort] = useState('')
    const [port_comm, setPortComm] = useState('');
    const [button, setButton] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [speed, setSpeed] = useState(0);

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
        if (data.beta !== null) {
            // Only try to send if we're actually connected
            if (wsClient.isConnected()) {
                wsClient.sendBetaValue(data.beta);
            }
        }
    }, [data.beta]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (speed !== null && wsClient.isConnected()) {
                wsClient.sendSpeedValue(speed);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInputExample placeholderText={'IP address'} value={ipAddress} onChangeValue={setIpAddress} />
                <TextInputExample placeholderText={'port'} value={port} onChangeValue={(newPort) => { setPort(newPort); console.log('IP:', ipAddress, 'Port:', newPort); }} />
            </View>
            <View style={styles.inputCom}>
                <TextInputExample placeholderText={'TCP port'} value={port_comm} onChangeValue={setPortComm} />
            </View>
            <View style={styles.buttonRight}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#1873CC' : '#2196F3' }
                    ]}
                    onPress={() => setSpeed(sliderValue)}
                    onResponderRelease={() => setSpeed(0)}
                    onPressIn={() => Vibration.vibrate(95)}
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
                    onPress={() => setSpeed(-sliderValue)}
                    onResponderRelease={() => setSpeed(0)}
                    onPressIn={() => Vibration.vibrate(95)}
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
                            backgroundColor: isConnected ? '#118c05' : (pressed ? '#1873CC' : '#2196F3'),
                            opacity: isConnected ? 0.7 : 1
                        },
                    ]}
                    onPress={() => {
                        if (!isConnected) {
                            setButton(true);
                            setIsConnected(true);
                        }
                    }}
                    disabled={isConnected}
                >
                    <Text style={styles.buttonText}>
                        {isConnected ? 'Connected' : 'Connect'}
                    </Text>
                </Pressable>
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <VerticalSlider
                    value={sliderValue}
                    onValueChange={(value) => {
                        Vibration.vibrate(95);
                        setSliderValue(value);
                    }}
                    title="Speed"
                    min={0}
                    max={255}
                />
            </View>
        </SafeAreaView>
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
        width: '100%',
        height: 40,
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
});