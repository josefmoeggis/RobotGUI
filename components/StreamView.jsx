import React from 'react';
import { StyleSheet } from 'react-native';
import WebView from "react-native-webview";

export interface LiveStreamingViewProps {
    ipAddress: string;
    port: string;
    connectBtn: boolean;
}

// Option 1: Named export
export const LiveStreamingView: React.FC<LiveStreamingViewProps> = ({ ipAddress, port, connectBtn }) => {
    const updateStream = connectBtn ? `
        document.body.style.backgroundColor = 'black';
        setInterval(() => {
            document.querySelector('img').src = 'http://${ipAddress}:${port}/frame?t=' + Date.now();
        }, 33);
    ` : '';

    return (
        <WebView
            source={{
                html: `<body style="margin:0;background:black;"><img style="width:100%;height:100%;object-fit:contain;" src="http://${ipAddress}:${port}/frame"></body>`
            }}
            style={styles.container}
            injectedJavaScript={updateStream}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});

// We can keep the default export as well if needed
export default LiveStreamingView;