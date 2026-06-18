import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type EmiSliderRowProps = {
  label?: string;
  hideLabel?: boolean;
  min: number;
  max: number;
  step: number;
  /** Numeric value driving thumb + fill (parent state). */
  value: number;
  onChange: (v: number) => void;
  /** Text shown in the always-mounted TextInput (parent state). */
  boxValue: string;
  onBoxChangeText: (t: string) => void;
  boxPrefix?: string;
  boxSuffix?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
  onBoxBlur?: () => void;
  placeholder?: string;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function roundStep(v: number, step: number): number {
  if (step >= 1) {
    return Math.round(v / step) * step;
  }
  const inv = Math.round(1 / step);
  return Math.round(v * inv) / inv;
}

/** 0..1 from parent `value` — thumb and teal fill read this every render. */
function trackPct(val: number, min: number, max: number): number {
  if (!Number.isFinite(val) || max <= min) {
    return 0;
  }
  if (val <= min) {
    return 0;
  }
  if (val >= max) {
    return 1;
  }
  return (val - min) / (max - min);
}

const THUMB = 24;
const TRACK_H = 6;
const ROW_H = 44;

function EmiSliderRow({
  label,
  hideLabel = false,
  min,
  max,
  step,
  value,
  onChange,
  boxValue,
  onBoxChangeText,
  boxPrefix,
  boxSuffix,
  keyboardType = 'decimal-pad',
  onBoxBlur,
  placeholder,
}: EmiSliderRowProps) {
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(1);

  const onChangeRef = useRef(onChange);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const stepRef = useRef(step);

  useEffect(() => {
    onChangeRef.current = onChange;
    minRef.current = min;
    maxRef.current = max;
    stepRef.current = step;
  }, [onChange, min, max, step]);

  const pct = trackPct(value, min, max);
  const fillW = trackW > 0 ? pct * trackW : 0;
  const thumbLeft =
    trackW > 0 ? clamp(pct * trackW - THUMB / 2, 0, trackW - THUMB) : 0;
  const thumbTop = (ROW_H - THUMB) / 2;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: evt => {
          const w = trackWRef.current || 1;
          const ratio = clamp(evt.nativeEvent.locationX / w, 0, 1);
          const minV = minRef.current;
          const maxV = maxRef.current;
          let next = minV + ratio * (maxV - minV);
          next = roundStep(next, stepRef.current);
          onChangeRef.current(clamp(next, minV, maxV));
        },
        onPanResponderMove: evt => {
          const w = trackWRef.current || 1;
          const ratio = clamp(evt.nativeEvent.locationX / w, 0, 1);
          const minV = minRef.current;
          const maxV = maxRef.current;
          let next = minV + ratio * (maxV - minV);
          next = roundStep(next, stepRef.current);
          onChangeRef.current(clamp(next, minV, maxV));
        },
      }),
    [],
  );

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    setTrackW(w);
  };

  return (
    <View style={styles.block}>
      {!hideLabel && label ? (
        <Text style={[styles.label, inter18('medium')]}>{label}</Text>
      ) : null}

      <View style={styles.valueBox}>
        {boxPrefix ? (
          <Text style={[styles.prefix, inter18('semiBold')]}>{boxPrefix}</Text>
        ) : null}
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          style={[styles.valueInput, inter18('semiBold')]}
          value={boxValue}
          onChangeText={onBoxChangeText}
          onBlur={onBoxBlur}
        />
        {boxSuffix ? (
          <Text style={[styles.inSuffix, inter18('semiBold')]}>{boxSuffix}</Text>
        ) : null}
      </View>

      <View
        style={styles.trackRow}
        collapsable={false}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}>
        <View style={styles.trackBar} pointerEvents="none">
          <View style={[styles.trackFill, { width: fillW }]} />
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: thumbLeft, top: thumbTop }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    marginBottom: 10,
  },
  prefix: {
    fontSize: 16,
    color: '#111827',
    marginRight: 4,
  },
  valueInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
    padding: 0,
    margin: 0,
    minWidth: 0,
  },
  inSuffix: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 6,
  },
  trackRow: {
    width: '100%',
    height: ROW_H,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBar: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  trackFill: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: '#14B8A6',
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
});

export default EmiSliderRow;
