import { StyleSheet, View, Text, Vibration, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputExample from "@/components/InputText";
import { useState } from "react";
import VideoStream from "@/components/VideoStreamComp";

export default function TabThreeScreen() {
    const [sliderValue, setSliderValue] = useState(30);
    const [ipAddress, setIpAddress] = useState('');
    const [port, setPort] = useState('');


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInputExample placeholderText={'IP address'} value={ipAddress} onChangeValue={setIpAddress} />
                <TextInputExample placeholderText={'port'} value={port} onChangeValue={(newPort) => { setPort(newPort); console.log('IP:', ipAddress, 'Port:', newPort); }} />
            </View>
            <View style={styles.buttonRight}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#1873CC' : '#2196F3' }
                    ]}
                    onPress={() => {}}
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
                    onPress={() => {}}
                    onPressIn={() => Vibration.vibrate(95)}


                >
                    <Text style={styles.buttonText}>REVERSE</Text>
                </Pressable>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Control Robot with Tilt</Text>
                <View style={styles.videoContainer}>
                    <VideoStream ip_address={ipAddress} port={port} />
                </View>
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