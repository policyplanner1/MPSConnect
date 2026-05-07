import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

type AuthInputProps = TextInputProps & {
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

function AuthInput({
  rightElement,
  containerStyle,
  style,
  ...props
}: AuthInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholderTextColor="#9CA3AF"
        style={[styles.input, style]}
        {...props}
      />
      {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 14,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  rightElement: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthInput;
