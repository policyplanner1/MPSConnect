import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export function EmiGridIcon({ size = 28, color = '#2563EB' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4 20V9l8-5 8 5v11"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Path
        d="M9 20v-6h6v6"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M12 4v3M10 7h4"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function LoanGridIcon({ size = 28, color = '#D97706' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Rect
        fill="none"
        height={14}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
        width={16}
        x={4}
        y={5}
      />
      <Path
        d="M8 9h8M8 12h8M8 15h5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function SipGridIcon({ size = 28, color = '#0284C7' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M6 18c0-4 2.5-7 6-9 3.5 2 6 5 6 9"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
      <Circle cx={12} cy={8} fill={color} r={2.2} />
      <Path
        d="M8 20h8"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function TaxGridIcon({ size = 28, color = '#DB2777' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Rect
        fill="none"
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
        width={14}
        x={5}
        y={4}
      />
      <Path
        d="M9 9h6M9 12h6M9 15h4"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function PlannerIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M6 4h12v16H6z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M9 8h6M9 12h6M9 16h4"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function SavingsTargetIcon({ size = 22, color = '#2563EB' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={12} fill="none" r={8} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} fill="none" r={4} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} fill={color} r={1.5} />
    </Svg>
  );
}

export function GoalFlagIcon({ size = 22, color = '#EA580C' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M6 4v16M6 4h10l-2.5 3L16 10H6"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Rect
        fill="none"
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
        width={16}
        x={4}
        y={5}
      />
      <Path d="M4 9h16" stroke={color} strokeWidth={1.8} />
      <Path
        d="M8 4v2M16 4v2"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 20, color = '#9CA3AF' }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

export function GridCalculatorIcon({
  type,
  size = 28,
}: {
  type: 'emi' | 'loan' | 'sip' | 'tax';
  size?: number;
}) {
  switch (type) {
    case 'emi':
      return <EmiGridIcon size={size} />;
    case 'loan':
      return <LoanGridIcon size={size} />;
    case 'sip':
      return <SipGridIcon size={size} />;
    case 'tax':
      return <TaxGridIcon size={size} />;
    default:
      return null;
  }
}

export function PlanningIcon({
  type,
  size = 22,
  color,
}: {
  type: 'planner' | 'savings' | 'goal';
  size?: number;
  color?: string;
}) {
  switch (type) {
    case 'planner':
      return <PlannerIcon color={color ?? '#FFFFFF'} size={size} />;
    case 'savings':
      return <SavingsTargetIcon color={color ?? '#2563EB'} size={size} />;
    case 'goal':
      return <GoalFlagIcon color={color ?? '#EA580C'} size={size} />;
    default:
      return null;
  }
}
