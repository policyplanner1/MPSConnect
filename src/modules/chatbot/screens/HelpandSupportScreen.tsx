import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import GotMarriedIcon from '../../../assets/images/icons/gotmarriedicon.svg';
import NewHomeIcon from '../../../assets/images/icons/newhome_icon.svg';
import PassportIcon from '../../../assets/images/icons/passport_gd.svg';
import WorkIcon from '../../../assets/images/icons/work_icon.svg';

type HelpandSupportScreenProps = {
  onBack?: () => void;
  onCategorySelect?: (categoryId: CategoryChipIcon) => void;
  onChatWithUs?: (responseKey?: string) => void;
  onOpenApplicationIssue?: (responseKey?: string) => void;
};

type CategoryChipIcon = 'travel' | 'property' | 'marriage' | 'job' | 'house';

type SupportIssueOption = {
  label: string;
  responseKey: string;
};

type SupportIssue = {
  id: string;
  options: SupportIssueOption[];
  responseKey: string;
  title: string;
};

const SUPPORT_ISSUES: SupportIssue[] = [
  {
    id: 'application',
    title: 'Application stuck in processing',
    responseKey: 'application_stuck_in_processing',
    options: [
      {
        label: 'I want to check why my application is still processing.',
        responseKey: 'application_processing_status_check',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery Issues',
    responseKey: 'delivery_not_delivered',
    options: [
      { label: 'My document was not delivered.', responseKey: 'delivery_not_delivered' },
      { label: 'My document delivery is delayed.', responseKey: 'delivery_delayed' },
      { label: 'The delivery address is incorrect.', responseKey: 'delivery_address_incorrect' },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Issues',
    responseKey: 'payment_deducted_service_not_started',
    options: [
      {
        label: 'My payment was deducted but the service did not start.',
        responseKey: 'payment_deducted_service_not_started',
      },
      {
        label: "I initiated refund for a service but didn't receive refund",
        responseKey: 'payment_refund_not_received',
      },
    ],
  },
  {
    id: 'document',
    title: 'Document / Verification Issues',
    responseKey: 'document_unable_to_upload',
    options: [
      { label: 'I am unable to upload my documents.', responseKey: 'document_unable_to_upload' },
      { label: 'My uploaded document was rejected.', responseKey: 'document_rejected' },
      { label: 'The system says my document format is invalid.', responseKey: 'document_invalid_format' },
    ],
  },
  {
    id: 'service',
    title: 'Service Selection Issues',
    responseKey: 'service_pan_eligibility',
    options: [
      { label: 'I want to know if I am eligible for PAN Card', responseKey: 'service_pan_eligibility' },
      { label: 'I want to know which documents are required for PAN Card', responseKey: 'service_pan_documents' },
      { label: 'I want to know how long the process will take for Aadhar card correction', responseKey: 'service_aadhaar_timeline' },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance Issues',
    responseKey: 'insurance_policy_not_generated',
    options: [
      { label: 'My insurance policy has not been generated.', responseKey: 'insurance_policy_not_generated' },
      { label: 'I need help with the insurance claim process.', responseKey: 'insurance_claim_help' },
      { label: 'I made the payment but my insurance policy is still inactive.', responseKey: 'insurance_policy_inactive' },
    ],
  },
  {
    id: 'status',
    title: 'Status / Tracking Issues',
    responseKey: 'status_application_status',
    options: [
      { label: 'I want to check my application status.', responseKey: 'status_application_status' },
      { label: 'My application is delayed', responseKey: 'status_application_delayed' },
    ],
  },
];

function BackArrowIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke="#262626"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
    </Svg>
  );
}

function ChevronIcon({ expanded = false }: { expanded?: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d={expanded ? 'M6 9L12 15L18 9' : 'M9 6L15 12L9 18'}
        fill="none"
        stroke="#737373"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function CategoryChip({
  onPress,
  label,
  icon,
}: {
  label: string;
  icon: CategoryChipIcon;
  onPress?: (icon: CategoryChipIcon) => void;
}) {
  const iconMap = {
    travel: PassportIcon,
    property: NewHomeIcon,
    marriage: GotMarriedIcon,
    job: WorkIcon,
    house: NewHomeIcon,
  } as const;
  const IconComponent = iconMap[icon];

  return (
    <Pressable onPress={() => onPress?.(icon)} style={styles.categoryChip}>
      <View style={styles.categoryIconWrap}>
        <IconComponent width={16} height={16} />
      </View>
      <Text style={styles.categoryChipText}>{label}</Text>
    </Pressable>
  );
}

function HelpandSupportScreen({
  onBack,
  onCategorySelect,
  onChatWithUs,
  onOpenApplicationIssue,
}: HelpandSupportScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => onBack?.()} style={styles.backButton}>
            <BackArrowIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.listWrap}>
            {SUPPORT_ISSUES.map(issue => {
              const isExpanded = expandedId === issue.id;

              return (
                <View key={issue.id} style={styles.issueRowWrap}>
                  <Pressable
                    onPress={() => {
                      if (issue.id === 'application') {
                        onOpenApplicationIssue?.(issue.responseKey);
                        return;
                      }

                      setExpandedId(current => (current === issue.id ? null : issue.id));
                    }}
                    style={styles.issueRow}>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <ChevronIcon expanded={issue.id === 'application' ? false : isExpanded} />
                  </Pressable>

                  {issue.id !== 'application' && isExpanded ? (
                    <View style={styles.issueBody}>
                      {issue.options.map((option, index) => (
                        <Pressable
                          key={option.responseKey}
                          onPress={() => onChatWithUs?.(option.responseKey)}
                          style={[
                            styles.issueOptionRow,
                            index < issue.options.length - 1
                              ? styles.issueOptionRowBorder
                              : undefined,
                          ]}>
                          <Text style={styles.issueOptionText}>{option.label}</Text>
                          <View style={styles.chatLinkButton}>
                            <Text style={styles.chatLinkText}>Chat</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}>

            <CategoryChip icon="marriage" label="Got married" onPress={onCategorySelect} />
            <CategoryChip icon="job" label="New job" onPress={onCategorySelect} />
            <CategoryChip icon="house" label="New house" onPress={onCategorySelect} />
            <CategoryChip icon="travel" label="Travel abroad" onPress={onCategorySelect} />
            <CategoryChip icon="property" label="Buying property" onPress={onCategorySelect} />
          </ScrollView>

          <View style={styles.chatCard}>
            <Text style={styles.chatCopy}>
              Describe your situation{'\n'}and we'll guide you...
            </Text>

            <Pressable onPress={() => onChatWithUs?.()} style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat with us</Text>
            </Pressable>
          </View>
        </View>
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
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 32,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  headerSpacer: {
    width: 34,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 18,
  },
  listWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  issueRowWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  issueRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  issueTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#262626',
    paddingRight: 16,
  },
  issueBody: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: -4,
  },
  issueOptionRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 9,
  },
  issueOptionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  issueOptionText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#262626',
    paddingRight: 10,
  },
  chatLinkButton: {
    minWidth: 48,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  chatLinkText: {
    fontSize: 12.5,
    color: '#6C4DFF',
    fontWeight: '500',
  },
  bottomArea: {
    marginTop: 'auto',
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    paddingRight: 18,
    gap: 8,
  },
  categoryChip: {
    minWidth: 108,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  categoryIconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#7A7A7A',
    fontWeight: '400',
    flexShrink: 1,
  },
  chatCard: {
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chatCopy: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#8A8A8A',
    fontStyle: 'italic',
    paddingRight: 10,
  },
  chatButton: {
    minWidth: 95,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HelpandSupportScreen;
