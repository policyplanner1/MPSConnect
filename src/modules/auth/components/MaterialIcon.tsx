import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

function SvgIcon({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}) {
  if (name === 'visibility' || name === 'eye') {
    return (
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Path
          d="M2 12C4.5 7.8 8 5.7 12 5.7C16 5.7 19.5 7.8 22 12C19.5 16.2 16 18.3 12 18.3C8 18.3 4.5 16.2 2 12Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Circle cx="12" cy="12" fill="none" r="3.1" stroke={color} strokeWidth="1.8" />
      </Svg>
    );
  }

  if (name === 'visibility-off' || name === 'eye-off') {
    return (
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Path
          d="M2 12C4.5 7.8 8 5.7 12 5.7C16 5.7 19.5 7.8 22 12C19.5 16.2 16 18.3 12 18.3C8 18.3 4.5 16.2 2 12Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Circle cx="12" cy="12" fill="none" r="3.1" stroke={color} strokeWidth="1.8" />
        <Line stroke={color} strokeLinecap="round" strokeWidth="1.8" x1="5" x2="19" y1="19" y2="5" />
      </Svg>
    );
  }

  if (name === 'smartphone') {
    return (
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Rect
          fill="none"
          height="16"
          rx="2.2"
          stroke={color}
          strokeWidth="1.8"
          width="10"
          x="7"
          y="4"
        />
        <Line stroke={color} strokeLinecap="round" strokeWidth="1.8" x1="10.2" x2="13.8" y1="6.8" y2="6.8" />
        <Circle cx="12" cy="17.1" fill={color} r="0.9" />
      </Svg>
    );
  }

  return <View style={[styles.fallback, { width: size, height: size }]} />;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 24,
  color = '#000000',
  onPress,
  style,
  disabled = false,
}) => {
  const iconColor = disabled ? '#CCCCCC' : color;
  const icon = (
    <View style={style}>
      <SvgIcon color={iconColor} name={name} size={size} />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={styles.container}>
        {icon}
      </TouchableOpacity>
    );
  }

  return icon;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MaterialIcon;
