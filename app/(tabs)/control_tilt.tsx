import { StyleSheet, View, Text, Button, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoStreamScreen from "@/components/VideoStreamScreen";
import TextInputExample from "@/components/InputText";
import { useState } from "react";

export default function TabThreeScreen() {
    const [ipAddress, setIpAddress] = useState('');
    const [port, setPort] = useState('');
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInputExample placeholderText={'IP address'} value={ipAddress} onChangeValue={setIpAddress} />
                <TextInputExample placeholderText={'port'} value={port} onChangeValue={setPort} />
            </View>
            <View style={styles.buttonRight}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#1873CC' : '#2196F3' }
                    ]}
                    onPress={() => {}}
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
                >
                    <Text style={styles.buttonText}>REVERSE</Text>
                </Pressable>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Control Robot with Tilt</Text>
                <View style={styles.videoContainer}>
                    <VideoStreamScreen ip_address={ipAddress} port={port}/>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    inputContainer: {
        position: 'absolute',
        top: 25,
        left: 25,
        zIndex: 1,
        gap: 10,
    },
    buttonRight: {
        display: 'flex',
        position: 'absolute',
        top: '60%',
        right: '10%',
        height: '30%',
        width: '40%',
        borderRadius: '5%',
    },
    buttonLeft: {
        display: 'flex',
        position: 'absolute',
        top: '60%',
        left: '10%',
        height: '30%',
        width: '40%',
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
        width: '50%',
        height: '60%',
        alignSelf: 'center',
        marginTop: 10,
        margin: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    videoContainer: {
        height: '80%',
        backgroundColor: '#000',
    },
});