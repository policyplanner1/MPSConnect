import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import AppScreenHeader from '../../../components/AppScreenHeader';
import { IMAGE_BASE_URL } from '../../../config/env';
import { inter18 } from '../../../core/theme/typography';
import {
  getServiceEnquiryErrorMessage,
  mapFormToEnquiryPayload,
  submitServiceEnquiry,
} from '../api/serviceEnquiryApi';
import { useServiceDetails } from '../hooks/useServices';
import {
  EnquiryField,
  ServiceDocument,
  ServiceSection,
} from '../types/service.types';
import {
  getCrmEnquiryUserId,
  getCrmUserIdLinkErrorMessage,
  trySyncCrmUserIdFromProfile,
} from '../../../core/utils/crmUserSession';
import { addServiceCartItem, getServiceCartErrorMessage } from '../api/serviceCartApi';
import { validateEnquiryForm } from '../utils/enquiryValidation';
import { contactFromProfile, extractContactFromForm, mergeContactValues } from '../utils/serviceContact';
import { TAX_FILING_CATEGORY_ID } from '../IncomeTax/constants';
import { getCurrentUser } from '../../../services/auth.service';

type Props = {
  serviceId: number;
  fromCategoryId?: number;
  onBack: () => void;
  onOpenCart?: () => void;
  onOpenNotifications?: () => void;
  onOpenRewards?: () => void;
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx="18" cy="5" r="2.5" stroke="#555555" strokeWidth="1.8" fill="none" />
      <Circle cx="6" cy="12" r="2.5" stroke="#555555" strokeWidth="1.8" fill="none" />
      <Circle cx="18" cy="19" r="2.5" stroke="#555555" strokeWidth="1.8" fill="none" />
      <Path
        d="M8.5 13.5L15.5 18M15.5 6L8.5 10.5"
        stroke="#555555"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function StarFull() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="1.2"
      />
    </Svg>
  );
}


function CheckCirclePurple() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <Circle cx="15" cy="15" r="15" fill="#EDE9FF" />
      <Path
        d="M10 15L13.5 18.5L20 12"
        stroke="#6D28D9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CheckCircleGreen() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Circle cx="11" cy="11" r="11" fill="#22C55E" />
      <Path
        d="M6 11L9.5 14.5L16 8"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function ChevronDownIcon({ flipped = false }: { flipped?: boolean }) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      style={flipped ? { transform: [{ rotate: '180deg' }] } : undefined}>
      <Path
        d="M6 9L12 15L18 9"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function WhatsAppIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="12" fill="#25D366" />
      <Path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="1.8" fill="none" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function EmailIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M22 6l-10 7L2 6"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function QuestionCircleIcon() {
  return (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Circle cx="19" cy="19" r="19" fill="#5B21B6" />
      <Path
        d="M16 15C16 13.34 17.34 12 19 12C20.66 12 22 13.34 22 15C22 17 19.5 17.5 19.5 20"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="19.5" cy="24.5" r="1.5" fill="#FFFFFF" />
    </Svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTrustStat(stat: string): { value: string; label: string } {
  const words = stat.trim().split(/\s+/);
  if (words.length <= 2) {
    return { value: stat, label: '' };
  }
  return {
    value: words.slice(0, -2).join(' '),
    label: words.slice(-2).join(' '),
  };
}

const DEFAULT_ENQUIRY_FIELDS: EnquiryField[] = [
  {
    label: 'Name',
    field_name: 'name',
    field_type: 'text',
    options: null,
    is_required: 1,
  },
  {
    label: 'City',
    field_name: 'city',
    field_type: 'select',
    options: [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Pune',
      'Ahmedabad',
      'Jaipur',
      'New York',
      'Other',
    ],
    is_required: 1,
  },
  {
    label: 'Mobile Number',
    field_name: 'mobile',
    field_type: 'text',
    options: null,
    is_required: 1,
  },
  {
    label: 'Email ID',
    field_name: 'email',
    field_type: 'text',
    options: null,
    is_required: 1,
  },
  {
    label: 'Message',
    field_name: 'message',
    field_type: 'textarea',
    options: null,
    is_required: 0,
  },
];

function resolveEnquiryFields(apiFields: EnquiryField[]): EnquiryField[] {
  return apiFields.length > 0 ? apiFields : DEFAULT_ENQUIRY_FIELDS;
}

function fieldIcon(fieldName: string) {
  const key = fieldName.toLowerCase();
  if (key === 'name' || key === 'full_name') {
    return <PersonIcon />;
  }
  if (['mobile', 'mobile_number', 'phone', 'contact_number'].includes(key)) {
    return <PhoneIcon />;
  }
  if (key === 'email' || key === 'email_id') {
    return <EmailIcon />;
  }
  return null;
}

function fieldKeyboardType(fieldName: string): 'default' | 'email-address' | 'phone-pad' {
  const key = fieldName.toLowerCase();
  if (key === 'email' || key === 'email_id') {
    return 'email-address';
  }
  if (['mobile', 'mobile_number', 'phone', 'contact_number'].includes(key)) {
    return 'phone-pad';
  }
  return 'default';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating() {
  return (
    <View style={styles.ratingRow}>
      <Text style={[styles.ratingValue, inter18('bold')]}>5.0</Text>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i}><StarFull /></View>
      ))}
    </View>
  );
}

function FaqSection({ sections }: { sections: ServiceSection[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqSection = sections.find(s => s.section_type === 'faq');
  if (!faqSection) { return null; }

  return (
    <View style={styles.faqCard}>
      <View style={styles.faqCardHeader}>
        <Text style={[styles.faqTitle, inter18('bold')]}>{faqSection.title}</Text>
        <QuestionCircleIcon />
      </View>
      {faqSection.content.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => setOpenIndex(openIndex === i ? null : i)}
          style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <View style={styles.faqToggleBox}>
              <Text style={[styles.faqToggleChar, inter18('bold')]}>{openIndex === i ? '−' : '+'}</Text>
            </View>
            <Text style={[styles.faqQuestionText, inter18('semiBold')]}>{item.question}</Text>
          </View>
          {openIndex === i && (
            <Text style={[styles.faqAnswer, inter18('regular')]}>{item.answer}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function HelpBannerSection() {
  return (
    <View style={styles.helpBanner}>
      <View style={styles.helpTopRow}>
        <View style={styles.helpTextBlock}>
          <Text style={[styles.helpTitle, inter18('bold')]}>Need help with{'\n'}Government Documents?</Text>
          <Text style={[styles.helpSub, inter18('regular')]}>
            Our team will guide you step by step, from submission to completion.
          </Text>
        </View>
        <View style={styles.helpImageArea}>
          <Text style={styles.helpIllustrationEmoji}>📋</Text>
          <Text style={styles.helpSearchEmoji}>🔍</Text>
        </View>
      </View>
      <View style={styles.helpBtnRow}>
        <Pressable style={styles.helpPhoneBtn}>
          <Text style={[styles.helpPhoneText, inter18('bold')]}>+91 7798 612243</Text>
        </Pressable>
        <Pressable style={styles.helpTalkBtn}>
          <Text style={[styles.helpTalkText, inter18('bold')]}>Talk To Us</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ParagraphsSection({
  paragraphs,
}: {
  paragraphs: Array<{ title: string; content: string[] }>;
}) {
  if (!paragraphs.length) { return null; }
  return (
    <>
      {paragraphs.map((p, i) => (
        <View key={i} style={styles.paragraphCard}>
          <View style={styles.paragraphText}>
            <Text style={[styles.paragraphTitle, inter18('bold')]}>{p.title}</Text>
            {p.content.map((line, j) => (
              <Text key={j} style={[styles.paragraphBody, inter18('regular')]}>{line}</Text>
            ))}
          </View>
          <Text style={styles.paragraphEmoji}>📁</Text>
        </View>
      ))}
    </>
  );
}

function DocumentsSection({ documents }: { documents: ServiceDocument[] }) {
  const [tab, setTab] = useState<'store' | 'upload'>('store');
  const [expanded, setExpanded] = useState(false);

  if (!documents.length) { return null; }

  const visible = expanded ? documents : documents.slice(0, 3);

  return (
    <View style={styles.docCard}>
      <View style={styles.docHeader}>
        <Text style={[styles.docTitle, inter18('bold')]}>Documents to keep handy</Text>
        <Text style={styles.docFolderEmoji}>📂</Text>
      </View>

      {/* Toggle */}
      <View style={styles.docTabRow}>
        <Pressable
          onPress={() => setTab('store')}
          style={[styles.docTab, tab === 'store' && styles.docTabActive]}>
          <Text
            style={[
              styles.docTabText,
              inter18('semiBold'),
              tab === 'store' && styles.docTabTextActive,
            ]}>
            Office Visit
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('upload')}
          style={[styles.docTab, tab === 'upload' && styles.docTabActive]}>
          <Text
            style={[
              styles.docTabText,
              inter18('semiBold'),
              tab === 'upload' && styles.docTabTextActive,
            ]}>
            Upload
          </Text>
        </Pressable>
      </View>

      {/* Note */}
      <Text style={[styles.docNote, inter18('regular')]}>
        Note: Documents older than 3 months are not valid. Please provide necessary document issued within the last 3 months.
      </Text>

      {/* List */}
      {visible.map(doc => (
        <View key={doc.id} style={styles.docItem}>
          <CheckCircleGreen />
          <Text style={[styles.docItemText, inter18('medium')]}>{doc.document_name}</Text>
        </View>
      ))}

      {/* View all */}
      {documents.length > 3 && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={styles.viewAllBtn}>
          <ChevronDownIcon flipped={expanded} />
          <Text style={[styles.viewAllText, inter18('semiBold')]}>{expanded ? 'View less' : 'View all'}</Text>
        </Pressable>
      )}

      {/* Share */}
      <Pressable style={styles.shareDocBtn}>
        <Text style={[styles.shareDocText, inter18('bold')]}>Share</Text>
        <WhatsAppIcon />
      </Pressable>
    </View>
  );
}

function JourneySection({
  journey,
}: {
  journey: Array<{ title: string; content: string[][] }>;
}) {
  if (!journey.length) { return null; }
  const j = journey[0];

  return (
    <View style={styles.journeyCard}>
      <Text style={[styles.journeyTitle, inter18('bold')]}>{j.title}</Text>
      {j.content.map(([stepTitle, stepDesc], i) => (
        <View key={i} style={styles.journeyStep}>
          <View style={styles.journeyTimeline}>
            <View style={styles.journeyDot} />
            {i < j.content.length - 1 && <View style={styles.journeyLine} />}
          </View>
          <View style={styles.journeyStepContent}>
            <Text style={[styles.journeyStepTitle, inter18('bold')]}>{stepTitle}</Text>
            <Text style={[styles.journeyStepDesc, inter18('regular')]}>{stepDesc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

type EnquiryFormProps = {
  apiFields: EnquiryField[];
  serviceId: number;
  variantId: number;
  onValuesChange?: (values: Record<string, string>) => void;
};

function EnquiryForm({ apiFields, serviceId, variantId, onValuesChange }: EnquiryFormProps) {
  const fields = resolveEnquiryFields(apiFields);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void getCurrentUser()
      .then(profile => {
        if (cancelled) {
          return;
        }
        const contact = contactFromProfile(profile);
        setValues(prev => {
          const next = {
            ...prev,
            ...(contact.name && !prev.name?.trim() ? { name: contact.name } : {}),
            ...(contact.mobile && !prev.mobile?.trim() ? { mobile: contact.mobile } : {}),
            ...(contact.email && !prev.email?.trim() ? { email: contact.email } : {}),
          };
          onValuesChange?.(next);
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const setValue = (name: string, val: string) => {
    setValues(prev => {
      const next = { ...prev, [name]: val };
      onValuesChange?.(next);
      return next;
    });
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (successRef) {
      setSuccessRef(null);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateEnquiryForm(values, fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let userId = await getCrmEnquiryUserId();
    if (userId == null) {
      userId = await trySyncCrmUserIdFromProfile();
    }
    if (userId == null) {
      Alert.alert('CRM account required', getCrmUserIdLinkErrorMessage());
      return;
    }

    let profile = null;
    try {
      profile = await getCurrentUser();
    } catch {
      profile = null;
    }

    const mergedValues = mergeContactValues(values, profile);
    const payload = mapFormToEnquiryPayload(mergedValues, serviceId, variantId, userId);

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await submitServiceEnquiry(payload);
      setSuccessRef(response.data.enquiry_ref);
      setValues({});
      Alert.alert(
        'Enquiry submitted',
        `${response.message}\n\nReference: ${response.data.enquiry_ref}`,
      );
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[ServiceEnquiry] submitted:', response);
      }
    } catch (error) {
      Alert.alert('Could not submit', getServiceEnquiryErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={[styles.formTitle, inter18('bold')]}>Interested in this Service?</Text>
      <Text style={[styles.formSubtitle, inter18('regular')]}>
        Fill in the details below and our experts will get in touch with you.
      </Text>

      {successRef ? (
        <View style={styles.formSuccessBanner}>
          <Text style={[styles.formSuccessText, inter18('medium')]}>
            Submitted successfully. Reference: {successRef}
          </Text>
        </View>
      ) : null}

      {fields.map(field => {
        const icon = fieldIcon(field.field_name);
        const val = values[field.field_name] ?? '';
        const fieldError = errors[field.field_name];
        const isMobile = ['mobile', 'mobile_number', 'phone', 'contact_number'].includes(
          field.field_name.toLowerCase(),
        );
        const isEmail =
          field.field_name.toLowerCase() === 'email' ||
          field.field_name.toLowerCase() === 'email_id';

        return (
          <View key={field.field_name} style={styles.formField}>
            <Text style={[styles.formLabel, inter18('medium')]}>
              {field.is_required === 1 && (
                <Text style={[styles.required, inter18('medium')]}>*</Text>
              )}
              {field.label}
            </Text>

            {field.field_type === 'text' && (
              <View
                style={[
                  styles.inputRow,
                  fieldError ? styles.inputRowError : null,
                ]}>
                <TextInput
                  style={[styles.textInput, inter18('regular')]}
                  placeholder={
                    isMobile
                      ? 'Enter mobile number'
                      : isEmail
                        ? 'Enter email address'
                        : `Enter ${field.label.toLowerCase()}`
                  }
                  placeholderTextColor="#9CA3AF"
                  value={val}
                  onChangeText={v => setValue(field.field_name, v)}
                  keyboardType={fieldKeyboardType(field.field_name)}
                  autoCapitalize={isEmail ? 'none' : 'words'}
                  editable={!isSubmitting}
                />
                {icon ? <View style={styles.inputIcon}>{icon}</View> : null}
              </View>
            )}

            {field.field_type === 'select' && (
              <View>
                <Pressable
                  style={[
                    styles.selectTrigger,
                    fieldError ? styles.inputRowError : null,
                  ]}
                  disabled={isSubmitting}
                  onPress={() =>
                    setOpenDropdown(
                      openDropdown === field.field_name ? null : field.field_name,
                    )
                  }>
                  <Text
                    style={[
                      val ? styles.selectValue : styles.selectPlaceholder,
                      inter18('regular'),
                    ]}>
                    {val || 'Select city'}
                  </Text>
                  <ChevronDownIcon flipped={openDropdown === field.field_name} />
                </Pressable>
                {openDropdown === field.field_name &&
                  field.options?.map((opt, oi) => (
                    <Pressable
                      key={oi}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setValue(field.field_name, opt);
                        setOpenDropdown(null);
                      }}>
                      <Text style={[styles.dropdownOptionText, inter18('regular')]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {field.field_type === 'textarea' && (
              <TextInput
                style={[
                  styles.textArea,
                  inter18('regular'),
                  fieldError ? styles.inputRowError : null,
                ]}
                placeholder="Enter your message here..."
                placeholderTextColor="#9CA3AF"
                value={val}
                onChangeText={v => setValue(field.field_name, v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            )}

            {fieldError ? (
              <Text style={[styles.formErrorText, inter18('regular')]}>{fieldError}</Text>
            ) : null}
          </View>
        );
      })}

      <Pressable
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.submitBtnText, inter18('bold')]}>SUBMIT</Text>
        )}
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServiceDetailScreen({
  serviceId,
  fromCategoryId,
  onBack,
  onOpenCart,
  onOpenNotifications,
  onOpenRewards,
}: Props) {
  const {
    service,
    variants,
    sections,
    documents,
    enquiryFields,
    loading,
    error,
  } = useServiceDetails(serviceId);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const contentYRef = useRef(0);
  const enquiryOffsetYRef = useRef(0);
  const enquiryValuesRef = useRef<Record<string, string>>({});

  const handleCtaPress = async () => {
    if (!onOpenCart || !service || variants.length === 0) {
      scrollRef.current?.scrollTo({
        y: contentYRef.current + enquiryOffsetYRef.current,
        animated: true,
      });
      return;
    }

    let userId = await getCrmEnquiryUserId();
    if (userId == null) {
      userId = await trySyncCrmUserIdFromProfile();
    }
    if (userId == null) {
      Alert.alert('CRM account required', getCrmUserIdLinkErrorMessage());
      return;
    }

    const v = variants[selectedIndex];
    let profile = null;
    try {
      profile = await getCurrentUser();
    } catch {
      profile = null;
    }
    const mergedContact = extractContactFromForm(
      mergeContactValues(enquiryValuesRef.current, profile),
    );

    if (!mergedContact.name.trim() || !mergedContact.mobile.trim()) {
      Alert.alert(
        'Contact details required',
        'Please add your name and mobile number in your profile, or fill the enquiry form below before buying.',
      );
      scrollRef.current?.scrollTo({
        y: contentYRef.current + enquiryOffsetYRef.current,
        animated: true,
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      await addServiceCartItem({
        user_id: userId,
        service_id: service.id,
        variant_id: v.id,
        quantity: 1,
        name: mergedContact.name,
        mobile: mergedContact.mobile,
      });
      onOpenCart();
    } catch (error) {
      Alert.alert('Could not add to cart', getServiceCartErrorMessage(error));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isTaxFlow =
    fromCategoryId === TAX_FILING_CATEGORY_ID ||
    service?.category_id === TAX_FILING_CATEGORY_ID;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader
          variant="search"
          onBack={onBack}
          searchPlaceholder="Search services"
          showWallet={!isTaxFlow}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6D28D9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service || variants.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader
          variant="search"
          onBack={onBack}
          searchPlaceholder="Search services"
          showWallet={!isTaxFlow}
        />
        <View style={styles.centered}>
          <Text style={[styles.errorText, inter18('regular')]}>{error ?? 'Service not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const variant = variants[selectedIndex];
  const variantImageUri = `${IMAGE_BASE_URL}/${variant.image_url}`;
  const price = parseFloat(variant.price);
  const isTaxService = isTaxFlow;

  const walletBalance = `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const searchPlaceholder = `Search "${service.name}"`;
  const buyNowLabel = `Buy now ₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenHeader
        variant="search"
        onBack={onBack}
        searchPlaceholder={searchPlaceholder}
        onNotificationPress={onOpenNotifications}
        onWalletPress={isTaxService ? undefined : onOpenRewards}
        walletBalance={isTaxService ? undefined : walletBalance}
        showWallet={!isTaxService}
        notificationCount={1}
      />
      <ScrollView
        ref={scrollRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextBlock}>
              <Text style={[styles.heroTitle, inter18('bold')]}>
                Simplifying{'\n'}Aadhaar for You
              </Text>
              <Text style={[styles.heroSub, inter18('medium')]}>Efficient Support.</Text>
              <Text style={[styles.heroSub, inter18('medium')]}>Zero Hassle.</Text>
            </View>
            <Image
              source={{ uri: variantImageUri }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <Pressable style={styles.shareBtn}>
            <ShareIcon />
          </Pressable>
        </View>

        {/* ── Variant Tabs ── */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}>
            {variants.map((v, i) => {
              const selected = i === selectedIndex;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedIndex(i)}
                  style={[styles.tab, selected && styles.tabSelected]}>
                  <Text
                    style={[
                      styles.tabTitle,
                      inter18('semiBold'),
                      selected && styles.tabTitleSelected,
                    ]}>
                    {v.title}
                  </Text>
                  <View style={styles.tabPriceRow}>
                    <Text style={[styles.tabPrice, inter18('bold')]}>
                      ₹{parseFloat(v.price).toFixed(0)}
                    </Text>
                    <Text style={[styles.tabOriginalPrice, inter18('regular')]}>
                      ₹{parseFloat(v.original_price).toFixed(0)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Main Content ── */}
        <View style={styles.content} onLayout={(e) => { contentYRef.current = e.nativeEvent.layout.y; }}>

          {/* Title + Rating */}
          <View style={styles.titleRow}>
            <Text style={[styles.variantTitle, inter18('bold')]}>{variant.title}</Text>
            <StarRating />
          </View>

          {/* Description */}
          <Text style={[styles.description, inter18('regular')]}>{variant.short_description}</Text>

          {/* CTA Button */}
          <Pressable
            style={[styles.ctaBtn, isAddingToCart && styles.ctaBtnDisabled]}
            onPress={handleCtaPress}
            disabled={isAddingToCart}>
            {isAddingToCart ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.ctaBtnText, inter18('bold')]}>{buyNowLabel}</Text>
            )}
          </Pressable>

          {/* Save for Later */}
          <Pressable style={styles.saveBtn}>
            <Text style={[styles.saveBtnBold, inter18('bold')]}>Save for later</Text>
          </Pressable>

          {/* Details List */}
          {variant.details.length > 0 && (
            <View style={styles.detailsList}>
              {variant.details.map((detail, i) => (
                <View key={i} style={styles.detailItem}>
                  <CheckCirclePurple />
                  <Text style={[styles.detailText, inter18('medium')]}>{detail}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Trust Stats */}
          {variant.trust_stats.length > 0 && (
            <View style={styles.trustRow}>
              {variant.trust_stats.map((stat, i) => {
                const { value, label } = parseTrustStat(stat);
                return (
                  <View
                    key={i}
                    style={[
                      styles.trustItem,
                      i < variant.trust_stats.length - 1 && styles.trustItemBorder,
                    ]}>
                    <Text style={[styles.trustValue, inter18('bold')]}>{value}</Text>
                    {label ? (
                      <Text style={[styles.trustLabel, inter18('regular')]}>{label}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Paragraphs (100% Data Safety etc.) ── */}
          <ParagraphsSection paragraphs={variant.paragraphs} />

          {/* ── Documents ── */}
          <DocumentsSection documents={documents} />

          {/* ── Journey Timeline ── */}
          <JourneySection journey={variant.journey} />

          {/* ── Enquiry Form ── */}
          <View onLayout={(e) => { enquiryOffsetYRef.current = e.nativeEvent.layout.y; }}>
            <EnquiryForm
              apiFields={enquiryFields}
              serviceId={service.id}
              variantId={variant.id}
              onValuesChange={values => {
                enquiryValuesRef.current = values;
              }}
            />
          </View>

          {/* ── FAQ ── */}
          <FaqSection sections={sections} />

          {/* ── Help Banner ── */}
          <HelpBannerSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // ── Hero
  hero: {
    backgroundColor: '#FFFFFF',
    minHeight: 180,
    overflow: 'hidden',
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingLeft: 16,
  },

  heroTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  heroTitle: {
    fontSize: 20,
    color: '#111827',
    lineHeight: 26,
    marginBottom: 10,
  },

  heroSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },

  heroImage: {
    width: 180,
    height: 180,
  },

  shareBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tabs
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  tabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 120,
  },

  tabSelected: {
    borderColor: '#6D28D9',
    backgroundColor: '#FAFAFE',
  },

  tabTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  tabTitleSelected: {
    color: '#6D28D9',
  },

  tabPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  tabPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },

  tabOriginalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  // ── Content wrapper
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 14,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  variantTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginRight: 2,
  },

  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },

  // ── Offer Banner
  offerBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },

  offerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerEmoji: {
    fontSize: 20,
  },

  offerTextWrap: {
    flex: 1,
  },

  offerBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },

  offerSub: {
    fontSize: 12,
    color: '#D97706',
  },

  offerBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  offerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },

  // ── CTA
  ctaBtn: {
    backgroundColor: '#5B21B6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaBtnDisabled: {
    opacity: 0.7,
  },

  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    letterSpacing: 0.3,
  },

  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#5B21B6',
    backgroundColor: '#FFFFFF',
  },

  saveBtnText: {
    fontSize: 15,
    color: '#5B21B6',
    fontWeight: '400',
  },

  saveBtnBold: {
    fontWeight: '700',
    color: '#5B21B6',
  },

  // ── Details List
  detailsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Trust Stats
  trustRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },

  trustItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 3,
  },

  trustItemBorder: {
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },

  trustValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  trustLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── Paragraphs (Data Safety card)
  paragraphCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  paragraphText: {
    flex: 1,
  },

  paragraphTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },

  paragraphBody: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },

  paragraphEmoji: {
    fontSize: 36,
    lineHeight: 44,
  },

  // ── Documents
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  docTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  docFolderEmoji: {
    fontSize: 28,
  },

  docTabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },

  docTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  docTabActive: {
    backgroundColor: '#111827',
  },

  docTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  docTabTextActive: {
    color: '#FFFFFF',
  },

  docNote: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },

  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  docItemText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  shareDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 14,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  shareDocText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  // ── Journey
  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },

  journeyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },

  journeyStep: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },

  journeyTimeline: {
    alignItems: 'center',
    width: 20,
    paddingTop: 2,
  },

  journeyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },

  journeyLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
    marginBottom: 2,
    minHeight: 28,
  },

  journeyStepContent: {
    flex: 1,
    paddingBottom: 20,
  },

  journeyStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },

  journeyStepDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },

  // ── Enquiry Form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },

  formTitle: {
    fontSize: 17,
    color: '#5B21B6',
    marginBottom: 6,
  },

  formSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },

  formField: {
    marginBottom: 14,
  },

  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  required: {
    color: '#EF4444',
    fontWeight: '700',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },

  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111827',
  },

  inputIcon: {
    paddingRight: 12,
  },

  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  selectPlaceholder: {
    fontSize: 13,
    color: '#9CA3AF',
    flex: 1,
  },

  selectValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },

  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  dropdownOptionText: {
    fontSize: 13,
    color: '#374151',
  },

  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111827',
    minHeight: 100,
  },

  submitBtn: {
    marginTop: 8,
    backgroundColor: '#5B21B6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  submitBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  submitBtnDisabled: {
    opacity: 0.7,
  },

  inputRowError: {
    borderColor: '#EF4444',
  },

  formErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  formSuccessBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  formSuccessText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },

  // ── FAQ
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  faqCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  faqTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },

  faqItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },

  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },

  faqToggleBox: {
    width: 28,
    height: 28,
    // borderRadius: 6,
    // borderWidth: 1,
    // borderColor: '#E5E7EB',
    // backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  faqToggleChar: {
    fontSize: 18,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 22,
  },

  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  faqAnswer: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    paddingLeft: 54,
    paddingRight: 14,
    paddingBottom: 14,
  },

  // ── Help Banner
  helpBanner: {
    backgroundColor: '#EDE9FF',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },

  helpTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  helpTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },

  helpSub: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },

  helpImageArea: {
    width: 80,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpIllustrationEmoji: {
    fontSize: 52,
    lineHeight: 64,
  },

  helpSearchEmoji: {
    fontSize: 28,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  helpBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  helpPhoneBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpPhoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },

  helpTalkBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpTalkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
});
