import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppScreenHeader from '../../../components/AppScreenHeader';
import { inter18 } from '../../../core/theme/typography';
import SupportModeTabs from '../components/SupportModeTabs';

type SupportOptionsScreenProps = {
  onBack: () => void;
  onCreateTicket: () => void;
  onChatWithAssistant: () => void;
};

function SupportOptionCard({
  title,
  description,
  cta,
  onPress,
  variant = 'default',
}: {
  title: string;
  description: string;
  cta: string;
  onPress: () => void;
  variant?: 'default' | 'primary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isPrimary && styles.cardPrimary,
        pressed && styles.cardPressed,
      ]}>
      <Text style={[styles.cardTitle, inter18('semiBold')]}>{title}</Text>
      <Text style={[styles.cardDescription, inter18('regular')]}>{description}</Text>
      <View style={[styles.cardCta, isPrimary && styles.cardCtaPrimary]}>
        <Text style={[styles.cardCtaText, inter18('semiBold'), isPrimary && styles.cardCtaTextPrimary]}>
          {cta}
        </Text>
      </View>
    </Pressable>
  );
}

function SupportOptionsScreen({
  onBack,
  onCreateTicket,
  onChatWithAssistant,
}: SupportOptionsScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppScreenHeader variant="title" title="Help & Support" onBack={onBack} />

      <View style={styles.content}>
        <Text style={[styles.heading, inter18('bold')]}>How can we help?</Text>
        <Text style={[styles.subheading, inter18('regular')]}>
          Get instant guidance from our assistant or raise a ticket for our support team.
        </Text>

        <SupportOptionCard
          variant="primary"
          title="Chat with assistant"
          description="Ask about application status, payments, documents, or delivery. We check your account and reply with personalized updates."
          cta="Start chat"
          onPress={onChatWithAssistant}
        />

        <SupportOptionCard
          title="Create support ticket"
          description="Describe your issue in detail and our team will follow up with you."
          cta="Create ticket"
          onPress={onCreateTicket}
        />
      </View>

      <SupportModeTabs onChat={onChatWithAssistant} onTicket={onCreateTicket} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  heading: {
    fontSize: 22,
    color: '#111111',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    padding: 16,
    gap: 8,
  },
  cardPrimary: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTitle: {
    fontSize: 17,
    color: '#111111',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },
  cardCta: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cardCtaPrimary: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },
  cardCtaText: {
    fontSize: 13,
    color: '#111111',
  },
  cardCtaTextPrimary: {
    color: '#FFFFFF',
  },
});

export default SupportOptionsScreen;
