import React from 'react';
import {StyleSheet, TextInput} from 'react-native';

interface Props {
    placeholderText: string;
    value: string;
    onChangeValue: (value: string) => void;
}

const TextInputExample = ({ placeholderText, value, onChangeValue }: Props) => {
    return (
        <TextInput
            style={styles.input}
            onChangeText={onChangeValue}
            value={value}
            placeholder={placeholderText}
            keyboardType="numeric"
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

export default TextInputExample;