import { StyleSheet, View, Text, Button} from 'react-native';
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
                <Button title="DRIVE" onPress={() => {}}/>
            </View>
            <View style={styles.buttonLeft}>
                <Button title="REVERSE" onPress={() => {}}/>
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
        position: 'absolute',
        top: '80%',
        right: '20%',
        height: '15%',
        width: '20%',
    },
    buttonLeft: {
        position: 'absolute',
        top: '80%',
        left: '20%',
        height: '15%',
        width: '20%',
    },
    content: {
        width: '50%',
        height: '60%',
        alignSelf: 'center',
        marginTop: 10,
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