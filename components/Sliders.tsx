import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider, Text, Icon } from '@rneui/themed';

type SlidersComponentProps = {
    value: number;
    onValueChange: (value: number) => void;
    title?: string;
    min?: number;
    max?: number;
};

const VerticalSlider: React.FunctionComponent<SlidersComponentProps> = ({
        value,
        onValueChange,
        title = "Vertical Slider",
        min = 0,
        max = 10
    }) => {
    const interpolate = (start: number, end: number) => {
        let k = (value - min) / (max - min); // Normalized between min and max
        return Math.ceil((1 - k) * start + k * end) % 256;
    };

    const color = () => {
        let r = interpolate(255, 0);
        let g = interpolate(0, 255);
        let b = interpolate(0, 0);
        return `rgb(${r},${g},${b})`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.subHeader}>{title}</Text>

            <View style={styles.verticalContent}>
                <Slider
                    value={value}
                    onValueChange={onValueChange}
                    maximumValue={max}
                    minimumValue={min}
                    step={1}
                    allowTouchTrack
                    orientation="vertical"
                    trackStyle={{ width: 5, backgroundColor: 'transparent' }}
                    thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
                    thumbProps={{
                        children: (
                            <Icon
                                name="heartbeat"
                                type="font-awesome"
                                size={20}
                                reverse
                                containerStyle={{ bottom: 20, right: 20 }}
                                color={color()}
                            />
                        ),
                    }}
                />
                <Text style={styles.valueText}>Value: {value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,  // Fixed height for the container
        width: 100,   // Fixed width for the container
    },
    verticalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    subHeader: {
        backgroundColor: "#2089dc",
        color: "white",
        textAlign: "center",
        paddingVertical: 5,
        marginBottom: 10
    },
    valueText: {
        marginTop: 10,
        textAlign: 'center'
    }
});

export default VerticalSlider;