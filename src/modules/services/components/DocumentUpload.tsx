import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import type { LocalDocumentFile, ParentOrderDocument } from '../types/parentDocuments.types';

function FileDocIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="#7C3AED"
        strokeWidth="1.6"
        fill="none"
      />
      <Path d="M14 2v6h6" stroke="#7C3AED" strokeWidth="1.6" fill="none" />
    </Svg>
  );
}

function UploadArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 4v12M7 9l5-5 5 5M5 20h14"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

type DocumentUploadCardProps = {
  doc: ParentOrderDocument;
  file: LocalDocumentFile | null;
  uploading?: boolean;
  compact?: boolean;
  onUpload: () => void;
  onRemove: () => void;
};

export default function DocumentUploadCard({
  doc,
  file,
  uploading = false,
  compact = false,
  onUpload,
  onRemove,
}: DocumentUploadCardProps) {
  const cardStyles = compact ? compactStyles : styles;
  const isUploaded = doc.uploaded || Boolean(file);

  if (isUploaded && file) {
    return (
      <View style={cardStyles.uploadedCard}>
        <Pressable style={cardStyles.removeBtn} onPress={onRemove} hitSlop={8} disabled={uploading}>
          <View style={cardStyles.removeBtnInner}>
            <CloseIcon />
          </View>
        </Pressable>
        <View style={cardStyles.uploadedIconWrap}>
          <FileDocIcon />
        </View>
        <View style={cardStyles.uploadedTextWrap}>
          <Text style={[cardStyles.uploadedName, inter18('semiBold')]} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
        <Text style={[cardStyles.uploadedSize, inter18('regular')]}>Size: {file.sizeLabel}</Text>
      </View>
    );
  }

  if (doc.uploaded) {
    const label = doc.file_url ? doc.document_name : `${doc.document_name} (uploaded)`;
    return (
      <View style={cardStyles.uploadedCard}>
        <View style={cardStyles.uploadedIconWrap}>
          <FileDocIcon />
        </View>
        <View style={cardStyles.uploadedTextWrap}>
          <Text style={[cardStyles.uploadedName, inter18('semiBold')]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <Text style={[cardStyles.uploadedSize, inter18('regular')]}>Uploaded</Text>
      </View>
    );
  }

  return (
    <Pressable style={cardStyles.pendingCard} onPress={onUpload} disabled={uploading}>
      <View style={cardStyles.pendingIconWrap}>
        <FileDocIcon />
      </View>
      <View style={cardStyles.pendingTextWrap}>
        <Text style={[cardStyles.pendingTitle, inter18('semiBold')]} numberOfLines={1}>
          {doc.document_name}
        </Text>
        <Text style={[cardStyles.pendingHint, inter18('regular')]}>
          {doc.is_mandatory ? 'Mandatory' : 'Optional'} • JPG, PNG, PDF
        </Text>
      </View>
      <View style={cardStyles.pendingRight}>
        <Text style={[cardStyles.pendingMax, inter18('regular')]}>
          {uploading ? 'Selecting…' : 'Max 2MB'}
        </Text>
        <UploadArrowIcon />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 88,
  },
  pendingIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    opacity: 0.85,
  },
  pendingTextWrap: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
  },
  pendingHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  pendingRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  pendingMax: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  uploadedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 72,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 2,
  },
  removeBtnInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadedTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  uploadedName: {
    fontSize: 15,
    color: '#111827',
  },
  uploadedSize: {
    fontSize: 13,
    color: '#6B7280',
  },
});

const compactStyles = StyleSheet.create({
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
  },
  pendingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    opacity: 0.85,
  },
  pendingTextWrap: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  pendingHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  pendingRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pendingMax: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  uploadedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 56,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 2,
  },
  removeBtnInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  uploadedTextWrap: {
    flex: 1,
    marginRight: 6,
  },
  uploadedName: {
    fontSize: 14,
    color: '#111827',
  },
  uploadedSize: {
    fontSize: 11,
    color: '#6B7280',
  },
});
