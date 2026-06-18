import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

const PRINCIPAL_COLOR = '#C4B5FD';
const INTEREST_COLOR = '#2563EB';

type Polar = { x: number; y: number };

function polar(cx: number, cy: number, r: number, angleDeg: number): Polar {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Donut wedge from startDeg to endDeg (degrees, clockwise from +x). */
function donutWedge(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  startDeg: number,
  endDeg: number,
): string {
  const sweep = endDeg - startDeg;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rOut, startDeg);
  const p2 = polar(cx, cy, rOut, endDeg);
  const p3 = polar(cx, cy, rIn, endDeg);
  const p4 = polar(cx, cy, rIn, startDeg);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

type EmiDonutChartProps = {
  principal: number;
  totalInterest: number;
  size?: number;
};

function EmiDonutChart({
  principal,
  totalInterest,
  size = 200,
}: EmiDonutChartProps) {
  const total = principal + totalInterest;
  const cx = size / 2;
  const cy = size / 2;
  const rOut = size * 0.38;
  const rIn = size * 0.24;

  if (total <= 0) {
    return (
      <View style={[styles.wrap, { width: size, height: size }]}>
        <Text style={[styles.empty, inter18('regular')]}>Enter loan details</Text>
      </View>
    );
  }

  const interestFrac = Math.min(1, Math.max(0, totalInterest / total));
  const principalFrac = 1 - interestFrac;

  const start = -90;

  const renderFullRing = (color: string) => (
    <G>
      <Path d={donutWedge(cx, cy, rOut, rIn, start, start + 180)} fill={color} />
      <Path d={donutWedge(cx, cy, rOut, rIn, start + 180, start + 360)} fill={color} />
    </G>
  );

  let chart: ReactNode;
  if (interestFrac < 0.0005) {
    chart = renderFullRing(PRINCIPAL_COLOR);
  } else if (principalFrac < 0.0005) {
    chart = renderFullRing(INTEREST_COLOR);
  } else {
    const interestEnd = start + interestFrac * 360;
    const principalEnd = start + 360;
    const interestPath = donutWedge(cx, cy, rOut, rIn, start, interestEnd);
    const principalPath = donutWedge(cx, cy, rOut, rIn, interestEnd, principalEnd);
    chart = (
      <G>
        <Path d={interestPath} fill={INTEREST_COLOR} />
        <Path d={principalPath} fill={PRINCIPAL_COLOR} />
      </G>
    );
  }

  return (
    <View style={styles.column}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {chart}
      </Svg>
      <View style={styles.legend}>
        <LegendRow color={PRINCIPAL_COLOR} label="Principal amount" />
        <LegendRow color={INTEREST_COLOR} label="Interest amount" />
      </View>
    </View>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, inter18('medium')]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  legend: {
    marginTop: 12,
    width: '100%',
    maxWidth: 260,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#4B5563',
  },
});

export default EmiDonutChart;
