import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

const WIDTH = 260;
const R = 88;
const STROKE = 14;
const CX = WIDTH / 2;
const CY = R + STROKE / 2 + 4;
const HEIGHT = CY + STROKE + 26;

/** Same polar as EmiDonutChart — SVG y-down, clockwise degrees from +x. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Top semicircle stroke: startDeg > endDeg, clockwise (sweep=1).
 * 180° = left (0%), 0° = right (100%), passes through 270° (top).
 */
function arcStroke(startDeg: number, endDeg: number): string {
  if (endDeg >= startDeg) {
    return '';
  }
  const sweep = startDeg - endDeg;
  const large = sweep > 180 ? 1 : 0;
  const p1 = polar(CX, CY, R, startDeg);
  const p2 = polar(CX, CY, R, endDeg);
  return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`;
}

type SavingsCapacityGaugeProps = {
  percent: number;
};

function SavingsCapacityGauge({ percent }: SavingsCapacityGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillEndDeg = 180 - (180 * clamped) / 100;

  const trackPath = useMemo(() => arcStroke(180, 0), []);
  const fillPath = useMemo(
    () => (clamped > 0 ? arcStroke(180, fillEndDeg) : ''),
    [clamped, fillEndDeg],
  );

  const left = polar(CX, CY, R, 180);
  const right = polar(CX, CY, R, 0);

  return (
    <View style={styles.wrap}>
      <Svg height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH}>
        <Path
          d={trackPath}
          fill="none"
          stroke="#E5E7EB"
          strokeLinecap="butt"
          strokeWidth={STROKE}
        />
        {fillPath ? (
          <Path
            d={fillPath}
            fill="none"
            stroke="#16A34A"
            strokeLinecap="round"
            strokeWidth={STROKE}
          />
        ) : null}
      </Svg>
      <Text style={[styles.edgeLabel, inter18('regular'), { left: left.x - 16, top: CY + 6 }]}>
        0%
      </Text>
      <Text style={[styles.edgeLabel, inter18('regular'), { left: right.x - 16, top: CY + 6 }]}>
        100%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: WIDTH,
    height: HEIGHT,
    alignSelf: 'center',
  },
  edgeLabel: {
    position: 'absolute',
    width: 32,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default SavingsCapacityGauge;
