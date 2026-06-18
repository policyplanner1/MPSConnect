import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import ChatbotBackground from '../components/ChatbotBackground';
import ChatbotButton from '../components/ChatbotButton';
import ChatbotCard from '../components/ChatbotCard';
import {
  sendSupportChatMessage,
  type SupportChatResponse,
} from '../api/supportChatApi';
import {
  CHATBOT_RESPONSE_MAP,
  DEFAULT_CHATBOT_RESPONSE,
} from '../data/chatbotResponses';
import type { ChatbotResponseContent } from '../types/chatbot.types';
import { chatbotType } from '../theme/chatbotTypography';
import { renderBotParagraphs } from '../utils/renderBotText';

type ASPScreenProps = {
  onActionPress?: (actionId: string, responseKey?: string) => void;
  onBack?: () => void;
  onCreateTicket?: () => void;
  responseKey?: string;
};

function formatTimeLabel(date = new Date()) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapApiToContent(
  apiResponse: SupportChatResponse,
  fallback: ChatbotResponseContent,
): ChatbotResponseContent {
  return {
    prompt: apiResponse.prompt || fallback.prompt,
    answerPrimary: apiResponse.answerPrimary || fallback.answerPrimary,
    answerSecondary: apiResponse.answerSecondary || fallback.answerSecondary,
    actions: apiResponse.actions?.length ? apiResponse.actions : fallback.actions,
  };
}

function ASPScreen({
  onActionPress,
  onBack,
  onCreateTicket,
  responseKey = 'application_stuck_in_processing',
}: ASPScreenProps) {
  const fallbackResponse = useMemo(
    () => CHATBOT_RESPONSE_MAP[responseKey] ?? DEFAULT_CHATBOT_RESPONSE,
    [responseKey],
  );
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<ChatbotResponseContent>(fallbackResponse);
  const [timeLabel] = useState(() => formatTimeLabel());

  useEffect(() => {
    let cancelled = false;

    async function loadResponse() {
      setLoading(true);
      setResponse(fallbackResponse);

      try {
        const apiResponse = await sendSupportChatMessage(
          fallbackResponse.prompt,
          responseKey,
        );

        if (cancelled) {
          return;
        }

        setResponse(mapApiToContent(apiResponse, fallbackResponse));
      } catch (error) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[Support chat] API failed, using static fallback:', error);
        }
        if (!cancelled) {
          setResponse(fallbackResponse);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResponse();

    return () => {
      cancelled = true;
    };
  }, [fallbackResponse, responseKey]);

  const displayResponse = useMemo(() => response, [response]);

  const botActions = useMemo(
    () =>
      displayResponse.actions.filter(
        action => action.id !== 'contact_support',
      ),
    [displayResponse.actions],
  );

  const handleActionPress = (actionId: string) => {
    if (actionId === 'contact_support') {
      onCreateTicket?.();
      return;
    }
    onActionPress?.(actionId, responseKey);
  };

  return (
    <ChatbotBackground
      contentContainerStyle={styles.contentContainer}
      onBack={onBack}>
      <View style={styles.innerContent}>
        <View style={styles.userMessageWrap}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{displayResponse.prompt}</Text>
          </View>
          <Text style={styles.userMessageTime}>{timeLabel}</Text>
        </View>

        <View style={styles.botSection}>
          <View style={styles.botDot} />

          <View style={styles.botContent}>
            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.loadingText}>Checking your account…</Text>
              </View>
            ) : (
              <ChatbotCard contentStyle={styles.cardContent} style={styles.card}>
                {renderBotParagraphs(displayResponse.answerPrimary, {
                  paragraphSpacingStyle: styles.cardTextParagraph,
                })}

                {displayResponse.answerSecondary
                  ? renderBotParagraphs(displayResponse.answerSecondary, {
                      baseStyle: styles.cardTextBottom,
                      paragraphSpacingStyle: styles.cardTextParagraph,
                    })
                  : null}
              </ChatbotCard>
            )}

            {!loading ? (
              <>
                {botActions.map((action, index) => (
                  <ChatbotButton
                    key={action.id}
                    label={action.label}
                    onPress={() => handleActionPress(action.id)}
                    style={index === 0 ? styles.primaryButton : styles.secondaryButton}
                  />
                ))}

                {onCreateTicket ? (
                  <ChatbotButton
                    label="Create support ticket"
                    onPress={onCreateTicket}
                    style={[
                      botActions.length === 0 ? styles.primaryButton : styles.secondaryButton,
                      styles.createTicketButton,
                    ]}
                  />
                ) : null}
              </>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionTime}>{timeLabel}</Text>
      </View>
    </ChatbotBackground>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 22,
    paddingHorizontal: 0,
    paddingBottom: 22,
  },
  innerContent: {
    flex: 1,
  },
  userMessageWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  userMessageBubble: {
    maxWidth: '70%',
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9DE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userMessageText: {
    ...chatbotType.userMessage,
  },
  userMessageTime: {
    ...chatbotType.timestamp,
    marginTop: 5,
    marginRight: 4,
  },
  botSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingLeft: 14,
    paddingRight: 14,
  },
  botDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#552389',
    marginTop: 0,
    marginLeft: -5,
    marginRight: 10,
  },
  botContent: {
    width: '70%',
    maxWidth: '70%',
  },
  loadingCard: {
    minHeight: 120,
    borderRadius: 8,
    backgroundColor: '#6C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingText: {
    ...chatbotType.botLoading,
  },
  card: {
    borderRadius: 8,
  },
  cardContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  cardTextBottom: {
    ...chatbotType.botBody,
    marginTop: 20,
  },
  cardTextParagraph: {
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 42,
    borderRadius: 8,
    marginTop: 14,
    borderColor: '#8E73F1',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 8,
    marginTop: 14,
    borderColor: '#8E73F1',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  createTicketButton: {
    marginTop: 14,
  },
  sectionTime: {
    ...chatbotType.timestamp,
    marginTop: 8,
    marginLeft: 18,
  },
});

export default ASPScreen;
