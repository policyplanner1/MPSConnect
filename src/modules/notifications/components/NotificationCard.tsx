import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import PassportIcon from '../../../assets/images/icons/passport_gd.svg';
import { inter18 } from '../../../core/theme/typography';
import { NOTIFICATION_VARIANT_STYLES } from '../store/notificationStore';

export type NotificationVariant =
  keyof typeof NOTIFICATION_VARIANT_STYLES;

export type NotificationCardProps = {
  title: string;
  body: string;
  timestamp: string;
  variant?: NotificationVariant;
  thumbnail?: 'passport' | null;
  onPress?: () => void;
};

function NotificationThumbnail({ kind }: { kind: 'passport' }) {
  if (kind === 'passport') {
    return (
      <View style={styles.thumbnailWrap}>
        <PassportIcon height={36} width={36} />
      </View>
    );
  }

  return null;
}

function NotificationCard({
  title,
  body,
  timestamp,
  variant = 'default',
  thumbnail = null,
  onPress,
}: NotificationCardProps) {
  const variantStyle = NOTIFICATION_VARIANT_STYLES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        variantStyle,
        pressed && onPress ? styles.cardPressed : null,
      ]}>
      {thumbnail ? (
        <View style={styles.row}>
          <NotificationThumbnail kind={thumbnail} />
          <View style={styles.contentWithThumb}>
            <CardContent body={body} timestamp={timestamp} title={title} />
          </View>
        </View>
      ) : (
        <CardContent body={body} timestamp={timestamp} title={title} />
      )}
    </Pressable>
  );
}

function CardContent({
  title,
  body,
  timestamp,
}: {
  title: string;
  body: string;
  timestamp: string;
}) {
  return (
    <>
      <View style={styles.titleRow}>
        <Text style={[styles.title, inter18('bold')]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.timestamp, inter18('regular')]}>{timestamp}</Text>
      </View>
      <Text style={[styles.body, inter18('regular')]}>{body}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  cardPressed: {
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumbnailWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWithThumb: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    lineHeight: 19,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  body: {
    marginTop: 6,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});

export default NotificationCard;
