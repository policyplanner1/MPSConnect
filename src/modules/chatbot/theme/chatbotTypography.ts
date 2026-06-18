import { TextStyle } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

/** Inter 18pt tokens aligned with MPS Connect chatbot UI spec. */
export const chatbotType = {
  headerTitle: {
    ...inter18('bold'),
    fontSize: 18,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    ...inter18('regular'),
    fontSize: 14,
    lineHeight: 18,
    color: '#757575',
  },
  avatarInitial: {
    ...inter18('bold'),
    fontSize: 13,
    color: '#6B7280',
  },
  composerPlaceholder: {
    ...inter18('regular'),
    fontSize: 16,
    lineHeight: 20,
    color: '#757575',
  },
  userMessage: {
    ...inter18('regular'),
    fontSize: 15,
    lineHeight: 21,
    color: '#1A1A1A',
  },
  timestamp: {
    ...inter18('regular'),
    fontSize: 12,
    lineHeight: 16,
    color: '#B0B0B0',
  },
  botBody: {
    ...inter18('regular'),
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  botBodyEmphasis: {
    ...inter18('bold'),
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  botLoading: {
    ...inter18('regular'),
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  actionButton: {
    ...inter18('medium'),
    fontSize: 16,
    lineHeight: 22,
    color: '#6A3DE8',
    textAlign: 'center',
  },
  helpHeaderTitle: {
    ...inter18('bold'),
    fontSize: 18,
    lineHeight: 22,
    color: '#111111',
  },
  issueTitle: {
    ...inter18('regular'),
    fontSize: 14,
    lineHeight: 20,
    color: '#262626',
  },
  issueOption: {
    ...inter18('regular'),
    fontSize: 13,
    lineHeight: 18,
    color: '#262626',
  },
  issueChatLink: {
    ...inter18('medium'),
    fontSize: 13,
    lineHeight: 18,
    color: '#6C4DFF',
  },
  categoryChip: {
    ...inter18('regular'),
    fontSize: 11,
    lineHeight: 14,
    color: '#7A7A7A',
  },
  helpPrompt: {
    ...inter18('regular'),
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    fontStyle: 'italic',
  },
  helpCta: {
    ...inter18('bold'),
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
  },
} as const satisfies Record<string, TextStyle>;
