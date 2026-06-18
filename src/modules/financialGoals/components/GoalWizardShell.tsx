import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import { inter18 } from '../../../core/theme/typography';
import { WIZARD_INPUT_STEPS } from '../types/goalWizard.types';

type GoalWizardShellProps = {
  title: string;
  stepIndex?: number;
  showProgress?: boolean;
  onBack?: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  children: React.ReactNode;
  footerNote?: string;
};

export default function GoalWizardShell({
  title,
  stepIndex,
  showProgress = false,
  onBack,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  children,
  footerNote,
}: GoalWizardShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title={title} />
      {showProgress && stepIndex != null ? (
        <View style={styles.progressWrap}>
          <Text style={[styles.progressText, inter18('semiBold')]}>
            Step {stepIndex} of {WIZARD_INPUT_STEPS}
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: WIZARD_INPUT_STEPS }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < stepIndex - 1 && styles.dotDone,
                  i === stepIndex - 1 && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        <View style={styles.footer}>
          {footerNote ? (
            <Text style={[styles.footerNote, inter18('regular')]}>{footerNote}</Text>
          ) : null}
          <Pressable
            disabled={primaryDisabled}
            onPress={onPrimary}
            style={({ pressed }) => [
              styles.primaryBtn,
              primaryDisabled && styles.primaryBtnDisabled,
              pressed && !primaryDisabled && styles.primaryBtnPressed,
            ]}>
            <Text style={[styles.primaryBtnText, inter18('bold')]}>{primaryLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  flex: {
    flex: 1,
  },
  progressWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#5E02AF',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotDone: {
    backgroundColor: '#C4B5FD',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#5E02AF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  footerNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#5E02AF',
    borderRadius: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#C4B5FD',
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
