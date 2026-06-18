import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type BundleBackgroundScreenProps = {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
  onBack?: () => void;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
};

const DEFAULT_BUNDLE_HEADER_TITLE = 'New Home Set Up Pack';

function BackIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke="#5B5B5B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
    </Svg>
  );
}

function BundleBackgroundScreen({
  children,
  contentContainerStyle,
  headerRight,
  onBack,
  title,
  titleStyle,
}: BundleBackgroundScreenProps) {
  const resolvedTitle = title ?? DEFAULT_BUNDLE_HEADER_TITLE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerShell}>
          <View style={styles.statusBarSpacing} />

          <View style={styles.headerBar}>
            <Pressable hitSlop={10} onPress={() => onBack?.()} style={styles.backButton}>
              <BackIcon />
            </Pressable>

            <View style={styles.titleWrap}>
              <Text numberOfLines={1} style={[styles.title, titleStyle]}>
                {resolvedTitle}
              </Text>
            </View>

            <View style={styles.headerRightWrap}>{headerRight}</View>
          </View>
        </View>

        <View style={[styles.contentContainer, contentContainerStyle]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerShell: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E1',
    shadowColor: '#151515',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBarSpacing: {
    height: 30,
  },
  headerBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    ...inter18('semiBold'),
    color: '#3F3A37',
  },
  headerRightWrap: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default BundleBackgroundScreen;
