import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import {
  getParentDocumentsErrorMessage,
  submitParentDocuments,
  uploadParentOrderDocumentsBatch,
} from '../api/parentDocumentsApi';
import DocumentUploadCard from '../components/DocumentUpload';
import DocsUploadedSuccessfully from '../components/DocsUploadedSuccessfully';
import { useParentDocuments } from '../hooks/useParentDocuments';
import type { LocalDocumentFile, ParentOrderDocument } from '../types/parentDocuments.types';
import type { ServiceDocument } from '../types/service.types';
import { mapServiceDocumentsToParentDocuments } from '../utils/parentDocumentsMapper';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
/** Space above Home screen floating bottom tabs (see ServicesBottomTabBar). */
const BOTTOM_TAB_CLEARANCE = 130;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);

type UploadDocumentsProps = {
  parentOrderId: string;
  orderId: string;
  /** From checkout when CRM parent-documents API is unavailable. */
  checkoutDocuments?: ServiceDocument[];
  onBack: () => void;
  onGoToOrders: () => void;
};

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M15 6L9 12L15 18"
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path
        d="M5 12L10 17L19 7"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function DocumentsProgressSummary({
  completedCount,
  totalCount,
  mandatoryCompleted,
  mandatoryTotal,
}: {
  completedCount: number;
  totalCount: number;
  mandatoryCompleted: number;
  mandatoryTotal: number;
}) {
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.docProgressCard}>
      <View style={styles.docProgressHeader}>
        <Text style={[styles.docProgressTitle, inter18('semiBold')]}>Documents</Text>
        <Text style={[styles.docProgressCount, inter18('bold')]}>
          {completedCount} of {totalCount}
        </Text>
      </View>
      <View style={styles.docProgressTrack}>
        <View
          style={[
            styles.docProgressFill,
            { width: `${Math.min(100, Math.round(progressRatio * 100))}%` },
          ]}
        />
      </View>
      <Text style={[styles.docProgressHint, inter18('regular')]}>
        {mandatoryTotal > 0 && mandatoryCompleted < mandatoryTotal
          ? `${mandatoryCompleted} of ${mandatoryTotal} required · ${completedCount} of ${totalCount} total`
          : `${completedCount} of ${totalCount} documents selected`}
      </Text>
    </View>
  );
}

function ProgressSteps() {
  const steps = [
    { label: 'Select Service', done: true },
    { label: 'Payment', done: true },
    { label: 'Documents', done: false, active: true },
  ];

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        {steps.map((step, index) => (
          <React.Fragment key={step.label}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  step.done ? styles.progressCircleDone : null,
                  step.active ? styles.progressCircleActive : null,
                ]}>
                {step.done ? <CheckIcon /> : <View style={styles.progressDot} />}
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  inter18(step.active ? 'semiBold' : 'regular'),
                  step.active ? styles.progressLabelActive : null,
                ]}
                numberOfLines={1}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 ? (
              <View
                style={[
                  styles.progressLine,
                  steps[index + 1].done || step.done ? styles.progressLineDone : null,
                ]}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function SubmitGradientButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.submitBtnOuter,
        disabled || loading ? styles.submitBtnDisabled : null,
        pressed && !disabled && !loading ? { opacity: 0.92 } : null,
      ]}>
      <Svg height={52} width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="uploadSubmitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#9E8DFF" />
            <Stop offset="100%" stopColor="#5B21B6" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={52} rx={10} fill="url(#uploadSubmitGrad)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.submitBtnText, inter18('bold')]}>{title}</Text>
      )}
    </Pressable>
  );
}

function UploadSuccessView({
  orderId,
  onGoToOrders,
}: {
  orderId: string;
  onGoToOrders: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.successScroll}
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.successAnimationWrap}>
        <DocsUploadedSuccessfully width={280} height={280} />
      </View>

      <Text style={[styles.successTitle, inter18('bold')]}>Documents Uploaded Successfully</Text>
      <Text style={[styles.successBody, inter18('regular')]}>
        Our team will review your documents and contact you via WhatsApp or call you shortly.
      </Text>
      <Text style={[styles.successOrderId, inter18('bold')]}>Order ID: {orderId}</Text>

      <Pressable
        style={({ pressed }) => [styles.goOrdersBtn, pressed ? { opacity: 0.85 } : null]}
        onPress={onGoToOrders}>
        <Text style={[styles.goOrdersBtnText, inter18('bold')]}>Go to Orders</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function resolveUserId(): Promise<number> {
  const crmUserId = await getCrmUserId();
  const fallbackUserId = await getUserId();
  const userId = crmUserId ?? fallbackUserId;
  if (!userId) {
    throw new Error('Please log in again to upload documents.');
  }
  return userId;
}

function isDocumentComplete(
  doc: ParentOrderDocument,
  localFiles: Record<string, LocalDocumentFile | null>,
): boolean {
  return doc.uploaded || Boolean(localFiles[doc.document_key]);
}

export default function UploadDocuments({
  parentOrderId,
  orderId,
  checkoutDocuments,
  onBack,
  onGoToOrders,
}: UploadDocumentsProps) {
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = BOTTOM_TAB_CLEARANCE + (insets.bottom || 0);

  const { data, loading, error, refetch } = useParentDocuments(parentOrderId);
  const [phase, setPhase] = useState<'upload' | 'success'>('upload');
  const [localFiles, setLocalFiles] = useState<Record<string, LocalDocumentFile | null>>({});
  const [pickingKey, setPickingKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fallbackDocList = useMemo(
    () => mapServiceDocumentsToParentDocuments(checkoutDocuments ?? []),
    [checkoutDocuments],
  );

  const docList = useMemo(() => {
    if (data?.documents && data.documents.length > 0) {
      return data.documents;
    }
    return fallbackDocList;
  }, [data?.documents, fallbackDocList]);

  const showLoading = loading && docList.length === 0;
  const showFatalError = !loading && Boolean(error) && docList.length === 0;

  const documentProgress = useMemo(() => {
    const mandatoryDocs = docList.filter(doc => doc.is_mandatory);
    const completedDocs = docList.filter(doc => isDocumentComplete(doc, localFiles));
    const mandatoryCompleted = mandatoryDocs.filter(doc =>
      isDocumentComplete(doc, localFiles),
    );

    const mandatoryTotal = mandatoryDocs.length;
    const mandatoryCompletedCount = mandatoryCompleted.length;
    const totalCount = docList.length;
    const completedCount = completedDocs.length;
    const allDocumentsComplete = totalCount > 0 && completedCount === totalCount;

    return {
      totalCount,
      completedCount,
      mandatoryTotal,
      mandatoryCompleted: mandatoryCompletedCount,
      allDocumentsComplete,
    };
  }, [docList, localFiles]);

  const canSubmit =
    docList.length > 0 && documentProgress.allDocumentsComplete && !submitting;

  const handlePickDocument = useCallback(
    async (doc: ParentOrderDocument) => {
      setPickingKey(doc.document_key);
      try {
        const [file] = await pick({
          type: [types.images, types.pdf],
        });
        if (!file?.uri) {
          return;
        }

        const mimeType = (file.type ?? '').toLowerCase();
        if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
          Alert.alert('Unsupported file', 'Please choose a JPG, PNG, or PDF file.');
          return;
        }

        if (file.size != null && file.size > MAX_FILE_BYTES) {
          Alert.alert('File too large', 'Maximum file size is 2MB.');
          return;
        }

        const fileName = file.name ?? doc.document_name;
        const [copyResult] = await keepLocalCopy({
          files: [
            {
              uri: file.uri,
              fileName,
              convertVirtualFileToType: file.isVirtual ? mimeType || 'application/pdf' : undefined,
            },
          ],
          destination: 'cachesDirectory',
        });

        if (copyResult.status === 'error') {
          throw new Error(copyResult.copyError);
        }

        const localFile: LocalDocumentFile = {
          name: fileName,
          sizeLabel: formatFileSize(file.size),
          uri: copyResult.localUri,
          type: mimeType || 'application/octet-stream',
        };

        setLocalFiles(prev => ({ ...prev, [doc.document_key]: localFile }));
      } catch (pickError) {
        if (isErrorWithCode(pickError) && pickError.code === errorCodes.OPERATION_CANCELED) {
          return;
        }
        Alert.alert(
          'Could not select file',
          getParentDocumentsErrorMessage(pickError),
        );
      } finally {
        setPickingKey(null);
      }
    },
    [],
  );

  const handleRemove = useCallback((documentKey: string) => {
    setLocalFiles(prev => ({ ...prev, [documentKey]: null }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const missingDocs = docList.filter(doc => !isDocumentComplete(doc, localFiles));
    if (missingDocs.length > 0) {
      Alert.alert(
        'Documents required',
        `Please select: ${missingDocs.map(d => d.document_name).join(', ')}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const userId = await resolveUserId();

      const pendingUploads = docList
        .filter(doc => !doc.uploaded && localFiles[doc.document_key])
        .map(doc => {
          const file = localFiles[doc.document_key]!;
          return {
            documentKey: doc.document_key,
            file: {
              uri: file.uri,
              name: file.name,
              type: file.type,
            },
            expiryDate: doc.expiry_date,
            documentNumber: doc.document_number,
          };
        });

      if (pendingUploads.length > 0) {
        await uploadParentOrderDocumentsBatch({
          parentOrderId,
          userId,
          documents: pendingUploads,
        });
      }

      await submitParentDocuments(parentOrderId, userId);
      setPhase('success');
    } catch (submitError) {
      Alert.alert('Submit failed', getParentDocumentsErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }, [docList, localFiles, parentOrderId]);

  if (phase === 'success') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <UploadSuccessView orderId={orderId} onGoToOrders={onGoToOrders} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <BackIcon />
        </Pressable>
      </View>

      {showLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#5B21B6" />
          <Text style={[styles.centerText, inter18('regular')]}>Loading documents…</Text>
        </View>
      ) : showFatalError ? (
        <View style={styles.center}>
          <Text style={[styles.errorTitle, inter18('bold')]}>Couldn’t load documents</Text>
          <Text style={[styles.errorText, inter18('regular')]}>{error}</Text>
          <Pressable
            onPress={() => {
              void refetch();
            }}
            style={({ pressed }) => [styles.retryBtn, pressed ? { opacity: 0.9 } : null]}>
            <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.warningBanner}>
              <Text style={[styles.warningBannerText, inter18('regular')]}>{error}</Text>
              <Pressable
                onPress={() => {
                  void refetch();
                }}
                hitSlop={8}>
                <Text style={[styles.warningBannerAction, inter18('semiBold')]}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={[styles.title, inter18('bold')]}>Documents Needed</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            Select each document below, then scroll down to submit.
          </Text>

          <ProgressSteps />

          {docList.length > 0 ? (
            <DocumentsProgressSummary
              completedCount={documentProgress.completedCount}
              totalCount={documentProgress.totalCount}
              mandatoryCompleted={documentProgress.mandatoryCompleted}
              mandatoryTotal={documentProgress.mandatoryTotal}
            />
          ) : null}

          <View style={styles.cardList}>
            {docList.map(doc => (
              <DocumentUploadCard
                key={doc.document_key}
                doc={doc}
                file={localFiles[doc.document_key] ?? null}
                uploading={pickingKey === doc.document_key}
                compact
                onUpload={() => {
                  void handlePickDocument(doc);
                }}
                onRemove={() => handleRemove(doc.document_key)}
              />
            ))}
          </View>

          <View style={styles.scrollFooter}>
            {!canSubmit && docList.length > 0 ? (
              <Text style={[styles.footerHint, inter18('regular')]}>
                {`Select ${documentProgress.totalCount - documentProgress.completedCount} more document(s) to enable submit`}
              </Text>
            ) : null}
            <SubmitGradientButton
              title="Submit documents"
              onPress={() => {
                void handleSubmit();
              }}
              disabled={!canSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export function generateUploadOrderId(): string {
  const suffix = Math.floor(10000 + Math.random() * 89999);
  return `#RP-ORD-${suffix}`;
}

const GREEN = '#22C55E';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  centerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    color: '#111827',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  warningBanner: {
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  warningBannerAction: {
    fontSize: 13,
    color: '#B45309',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  docProgressCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  docProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  docProgressTitle: {
    fontSize: 15,
    color: '#374151',
  },
  docProgressCount: {
    fontSize: 16,
    color: '#5B21B6',
  },
  docProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 8,
  },
  docProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  docProgressHint: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressWrap: {
    marginBottom: 16,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    width: 76,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  progressCircleDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  progressCircleActive: {
    borderColor: GREEN,
    borderWidth: 2.5,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#111827',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 11,
    marginHorizontal: -10,
  },
  progressLineDone: {
    backgroundColor: GREEN,
  },
  cardList: {
    gap: 8,
  },
  scrollFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  footerHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  submitBtnOuter: {
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  successScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },
  successAnimationWrap: {
    marginBottom: 16,
    width: 280,
    height: 280,
    flexShrink: 0,
  },
  successTitle: {
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successBody: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  successOrderId: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 36,
  },
  goOrdersBtn: {
    width: '100%',
    maxWidth: 340,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  goOrdersBtnText: {
    fontSize: 17,
    color: '#111827',
  },
});
