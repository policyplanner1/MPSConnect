import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { inter18 } from '../../../../core/theme/typography';
import { useDocVaultDocuments } from '../hooks/useDocVaultDocuments';
import type { VaultDocumentGlyph, VaultDocumentRecord } from '../types/docVault.types';
import {
  formatVaultDocumentDate,
  mapVaultDocumentPresentation,
} from '../utils/docVaultPresentation';
import {
  pickVaultFileFromDevice,
  pickVaultImageFromGallery,
  vaultFileTitle,
  type PickedVaultFile,
} from '../utils/pickVaultDocument';

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#111827"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Circle cx="11" cy="11" fill="none" r="7" stroke="#111827" strokeWidth="1.8" />
      <Path
        d="M20 20L16.5 16.5"
        fill="none"
        stroke="#111827"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke="#9CA3AF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </Svg>
  );
}

function DocumentGlyph({ glyph, color }: { glyph: VaultDocumentGlyph; color: string }) {
  if (glyph === 'passport') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Rect fill="none" height="16" rx="2" stroke={color} strokeWidth="1.8" width="14" x="5" y="4" />
        <Circle cx="12" cy="11" fill="none" r="3" stroke={color} strokeWidth="1.6" />
      </Svg>
    );
  }
  if (glyph === 'pan') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Rect fill="none" height="14" rx="2" stroke={color} strokeWidth="1.8" width="18" x="3" y="5" />
        <Path d="M7 15H11" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
      </Svg>
    );
  }
  if (glyph === 'aadhaar') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Rect fill="none" height="14" rx="2" stroke={color} strokeWidth="1.8" width="18" x="3" y="5" />
        <Path d="M8 10H16M8 14H13" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      </Svg>
    );
  }
  if (glyph === 'license') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Rect fill="none" height="12" rx="2" stroke={color} strokeWidth="1.8" width="16" x="4" y="6" />
        <Path d="M8 10H14M8 13H12" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      </Svg>
    );
  }
  if (glyph === 'insurance') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Path
          d="M12 3L20 7V12C20 16.4 16.9 20.3 12 21C7.1 20.3 4 16.4 4 12V7L12 3Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
      </Svg>
    );
  }

  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Rect fill="none" height="16" rx="2" stroke={color} strokeWidth="1.8" width="14" x="5" y="4" />
      <Path d="M9 9H15M9 13H13" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
    </Svg>
  );
}

function DocumentRow({
  item,
  onPress,
}: {
  item: VaultDocumentRecord;
  onPress: (item: VaultDocumentRecord) => void;
}) {
  const presentation = mapVaultDocumentPresentation(item);

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.docCard, pressed && { opacity: 0.94 }]}>
      <View style={[styles.docIconWrap, { backgroundColor: presentation.iconBg }]}>
        <DocumentGlyph color={presentation.iconColor} glyph={presentation.glyph} />
      </View>
      <View style={styles.docTextWrap}>
        <View style={styles.docTitleRow}>
          <Text style={[styles.docName, inter18('bold')]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.verifiedBadge}>
            <Text style={[styles.verifiedText, inter18('semiBold')]}>STORED</Text>
          </View>
        </View>
        <Text style={[styles.docMeta, inter18('regular')]}>
          Added: {formatVaultDocumentDate(item.createdAt)}
        </Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

type DocVaultScreenProps = {
  onBack: () => void;
};

export default function DocVaultScreen({ onBack }: DocVaultScreenProps) {
  const {
    documents,
    loading,
    refreshing,
    error,
    actionLoading,
    refetch,
    uploadDocument,
    removeDocument,
    downloadDocument,
    shareDocument,
  } = useDocVaultDocuments();

  const showPostUploadOptions = (uploaded: VaultDocumentRecord) => {
    Alert.alert('Document uploaded', `"${uploaded.title}" is saved in your vault.`, [
      {
        text: 'Download',
        onPress: () => {
          downloadDocument(uploaded.id).catch(err => {
            Alert.alert(
              'Download failed',
              err instanceof Error ? err.message : 'Could not open the document.',
            );
          });
        },
      },
      {
        text: 'Share',
        onPress: () => {
          shareDocument(uploaded).catch(err => {
            Alert.alert(
              'Share failed',
              err instanceof Error ? err.message : 'Could not share the document.',
            );
          });
        },
      },
      { text: 'Done', style: 'cancel' },
    ]);
  };

  const showDocumentActions = (item: VaultDocumentRecord) => {
    Alert.alert(item.title, 'What would you like to do?', [
      {
        text: 'Download',
        onPress: () => {
          downloadDocument(item.id).catch(err => {
            Alert.alert(
              'Download failed',
              err instanceof Error ? err.message : 'Could not open the document.',
            );
          });
        },
      },
      {
        text: 'Share',
        onPress: () => {
          shareDocument(item).catch(err => {
            Alert.alert(
              'Share failed',
              err instanceof Error ? err.message : 'Could not share the document.',
            );
          });
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete document', `Remove "${item.title}" from your vault?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                removeDocument(item.id).catch(err => {
                  Alert.alert(
                    'Delete failed',
                    err instanceof Error ? err.message : 'Could not delete document.',
                  );
                });
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadPickedFile = async (file: PickedVaultFile) => {
    try {
      const uploaded = await uploadDocument({
        title: vaultFileTitle(file.name),
        file: {
          uri: file.uri,
          name: file.name,
          type: file.type,
        },
      });
      showPostUploadOptions(uploaded);
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not upload document.',
      );
    }
  };

  const pickAndUpload = async (source: 'gallery' | 'files') => {
    try {
      const file =
        source === 'gallery'
          ? await pickVaultImageFromGallery()
          : await pickVaultFileFromDevice();

      if (!file) {
        return;
      }

      await uploadPickedFile(file);
    } catch (err) {
      Alert.alert(
        'Could not open picker',
        err instanceof Error ? err.message : 'Unable to access your files.',
      );
    }
  };

  const handleAddDocument = () => {
    Alert.alert('Upload document', 'Choose a file from your device.', [
      {
        text: 'Photo Gallery',
        onPress: () => {
          pickAndUpload('gallery').catch(() => undefined);
        },
      },
      {
        text: 'Files (PDF / Image)',
        onPress: () => {
          pickAndUpload('files').catch(() => undefined);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn} hitSlop={8}>
          <BackIcon />
        </Pressable>
        <Text style={[styles.headerTitle, inter18('bold')]}>DocVault</Text>
        <Pressable style={styles.headerBtn} hitSlop={8}>
          <SearchIcon />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refetch({ silent: true })}
            tintColor="#0056D2"
          />
        }>
        <View style={styles.heroCard}>
          <Text style={[styles.heroTitle, inter18('bold')]}>Secure Document Vault</Text>
          <Text style={[styles.heroSub, inter18('regular')]}>
            {documents.length > 0
              ? `${documents.length} document${documents.length === 1 ? '' : 's'} protected with bank-grade encryption.`
              : 'Your verified identity and financial documents are protected with bank-grade encryption.'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, inter18('bold')]}>Your Documents</Text>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color="#0056D2" />
            <Text style={[styles.centerText, inter18('regular')]}>Loading documents…</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text style={[styles.errorTitle, inter18('bold')]}>Couldn’t load documents</Text>
            <Text style={[styles.errorText, inter18('regular')]}>{error}</Text>
            <Pressable
              onPress={() => refetch()}
              style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
            </Pressable>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={[styles.emptyTitle, inter18('bold')]}>No documents yet</Text>
            <Text style={[styles.emptyText, inter18('regular')]}>
              Tap below to upload a document from your gallery or files.
            </Text>
          </View>
        ) : (
          <View style={styles.docList}>
            {documents.map(item => (
              <DocumentRow key={item.id} item={item} onPress={showDocumentActions} />
            ))}
          </View>
        )}

        <Pressable
          onPress={handleAddDocument}
          disabled={actionLoading}
          style={({ pressed }) => [
            styles.addBtn,
            (pressed || actionLoading) && { opacity: 0.92 },
          ]}>
          {actionLoading ? (
            <ActivityIndicator size="small" color="#0056D2" />
          ) : (
            <>
              <Text style={[styles.addBtnPlus, inter18('bold')]}>+</Text>
              <Text style={[styles.addBtnText, inter18('semiBold')]}>Add New Document</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  heroSub: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  tabsRow: {
    gap: 10,
    paddingRight: 8,
  },
  tab: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#E8EDF5',
  },
  tabSelected: {
    backgroundColor: '#0056D2',
  },
  tabText: {
    fontSize: 13,
    color: '#334155',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0F172A',
  },
  viewAll: {
    fontSize: 13,
    color: '#0056D2',
  },
  docList: {
    gap: 12,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  docIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  docName: {
    fontSize: 15,
    color: '#111827',
    flexShrink: 1,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: 9,
    color: '#16A34A',
    letterSpacing: 0.2,
  },
  docMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    gap: 10,
  },
  centerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111827',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#0056D2',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  addBtn: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnPlus: {
    fontSize: 20,
    color: '#0056D2',
    lineHeight: 22,
  },
  addBtnText: {
    fontSize: 14,
    color: '#0056D2',
  },
});
