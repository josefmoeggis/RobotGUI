import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

interface RotationData {
    rotation: { alpha: number; beta: number; gamma: number } | null;
}

export default function TabTwoScreen() {
    const [data, setData] = useState<RotationData>({
        rotation: null
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
                setData({ rotation: motionData.rotation });
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

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Device Rotation:</Text>
            <Text style={styles.text}>
                alpha (z): {data.rotation ? (data.rotation.alpha * 180/Math.PI).toFixed(2)   : '0.00'}°
            </Text>
            <Text style={styles.text}>
                beta (x): {data.rotation ? (data.rotation.beta * 180/Math.PI).toFixed(2) : '0.00'}°
            </Text>
            <Text style={styles.text}>
                gamma (y): {data.rotation ? (data.rotation.gamma * 180/Math.PI).toFixed(2) : '0.00'}°
            </Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
                    <Text>{subscription ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
                    <Text>Slow</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_fast} style={styles.button}>
                    <Text>Fast</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',

    },
    text: {
        textAlign: 'center',
        color: '#9c2525',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 15,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 10,
    },
    middleButton: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
});