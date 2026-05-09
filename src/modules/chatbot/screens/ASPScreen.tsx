import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';

import ChatbotBackground from '../components/ChatbotBackground';
import ChatbotButton from '../components/ChatbotButton';
import ChatbotCard from '../components/ChatbotCard';
import {
  CHATBOT_RESPONSE_MAP,
  DEFAULT_CHATBOT_RESPONSE,
} from '../data/chatbotResponses';

type ASPScreenProps = {
  onActionPress?: (actionId: string, responseKey?: string) => void;
  onBack?: () => void;
  responseKey?: string;
};

function renderParagraphs(
  text: string,
  textStyle: StyleProp<TextStyle>,
  paragraphSpacingStyle?: StyleProp<TextStyle>,
) {
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <Text
        key={`${paragraph}-${index}`}
        style={[textStyle, index > 0 ? paragraphSpacingStyle : null]}>
        {paragraph}
      </Text>
    ));
}

function ASPScreen({
  onActionPress,
  onBack,
  responseKey = 'application_stuck_in_processing',
}: ASPScreenProps) {
  const response = CHATBOT_RESPONSE_MAP[responseKey] ?? DEFAULT_CHATBOT_RESPONSE;

  return (
    <ChatbotBackground
      contentContainerStyle={styles.contentContainer}
      onBack={onBack}>
      <View style={styles.innerContent}>
        <View style={styles.userMessageWrap}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{response.prompt}</Text>
          </View>
          <Text style={styles.userMessageTime}>11.14 AM</Text>
        </View>

        <View style={styles.botSection}>
          <View style={styles.botDot} />

          <View style={styles.botContent}>
            <ChatbotCard contentStyle={styles.cardContent} style={styles.card}>
              {renderParagraphs(response.answerPrimary, styles.cardText, styles.cardTextParagraph)}

              {response.answerSecondary ? (
                renderParagraphs(
                  response.answerSecondary,
                  styles.cardTextBottom,
                  styles.cardTextParagraph,
                )
              ) : null}
            </ChatbotCard>

            {response.actions.map((action, index) => (
              <ChatbotButton
                key={action.id}
                label={action.label}
                onPress={() => onActionPress?.(action.id, responseKey)}
                style={index === 0 ? styles.primaryButton : styles.secondaryButton}
                textStyle={styles.buttonText}
              />
            ))}
          </View>
        </View>

        <Text style={styles.sectionTime}>11.14 AM</Text>
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#4A4A4A',
  },
  userMessageTime: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 14,
    color: '#B0B0B0',
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
  card: {
    borderRadius: 8,
  },
  cardContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 27,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  cardTextBottom: {
    marginTop: 26,
    fontSize: 13,
    lineHeight: 27,
    color: '#FFFFFF',
    fontWeight: '400',
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
  buttonText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5A5A5A',
    fontWeight: '400',
  },
  sectionTime: {
    marginTop: 8,
    marginLeft: 18,
    fontSize: 11,
    lineHeight: 14,
    color: '#B0B0B0',
  },
});

export default ASPScreen;
