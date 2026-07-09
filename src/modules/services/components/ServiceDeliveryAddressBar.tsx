import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import type { ServiceAddress } from '../types/serviceAddress.types';
import { formatServiceAddressLine } from '../utils/serviceAddress';

type ServiceDeliveryAddressBarProps = {
  address: ServiceAddress | null;
  loading?: boolean;
  onChangePress: () => void;
};

function HomeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5z"
        stroke="#2563EB"
        strokeWidth="1.8"
        fill="none"
      />
    </Svg>
  );
}

export default function ServiceDeliveryAddressBar({
  address,
  loading = false,
  onChangePress,
}: ServiceDeliveryAddressBarProps) {
  const actionLabel = address ? 'Change' : 'Add';

  return (
    <View style={styles.addressRow}>
      <HomeIcon />
      <View style={styles.addressText}>
        {loading ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : address ? (
          <>
            <Text style={[styles.addressName, inter18('bold')]}>
              Delivering to {address.fullName}
            </Text>
            <Text style={[styles.addressLine, inter18('regular')]} numberOfLines={2}>
              {formatServiceAddressLine(address)}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.addressName, inter18('bold')]}>Add delivery address</Text>
            <Text style={[styles.addressLine, inter18('regular')]}>
              Save your address to receive documents at home
            </Text>
          </>
        )}
      </View>
      <Pressable onPress={onChangePress} hitSlop={8}>
        <Text style={[styles.changeLink, inter18('bold')]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressText: {
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  addressName: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  changeLink: {
    fontSize: 13,
    color: '#2563EB',
  },
});
