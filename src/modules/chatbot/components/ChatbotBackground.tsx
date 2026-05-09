import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import CallChatbotIcon from '../../../assets/images/icons/Call_chatbot.svg';
import ChatChatbotIcon from '../../../assets/images/icons/chat_chatbot.svg';
import MicrophoneIcon from '../../../assets/images/icons/Microphone.svg';

type ChatbotBackgroundProps = ViewProps & {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  onCallPress?: () => void;
  onMenuPress?: () => void;
  onMicPress?: () => void;
  subtitle?: string;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
};

function BackIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke="#4B5563"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
    </Svg>
  );
}

function SmileIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="8.5" fill="none" stroke="#A1A1AA" strokeWidth={1.5} />
      <Circle cx="9" cy="10" r="1" fill="#A1A1AA" />
      <Circle cx="15" cy="10" r="1" fill="#A1A1AA" />
      <Path
        d="M8.7 14C9.5 15 10.6 15.5 12 15.5C13.4 15.5 14.5 15 15.3 14"
        fill="none"
        stroke="#A1A1AA"
        strokeLinecap="round"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

function AttachIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M9 12.5L13.9 7.6C15.2 6.3 17.3 6.3 18.6 7.6C19.9 8.9 19.9 11 18.6 12.3L11.6 19.3C9.7 21.2 6.7 21.2 4.8 19.3C2.9 17.4 2.9 14.4 4.8 12.5L11.2 6.1"
        fill="none"
        stroke="#A1A1AA"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect x="4" y="7" width="16" height="11" rx="2.5" fill="none" stroke="#A1A1AA" strokeWidth={1.5} />
      <Path
        d="M9 7L10.2 5.5H13.8L15 7"
        fill="none"
        stroke="#A1A1AA"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <Circle cx="12" cy="12.5" r="3" fill="none" stroke="#A1A1AA" strokeWidth={1.5} />
    </Svg>
  );
}

function ChatbotBackground({
  children,
  contentContainerStyle,
  onBack,
  onCallPress,
  onMenuPress,
  onMicPress,
  subtitle = 'Online',
  title = 'MPS Connect',
  titleStyle,
  ...viewProps
}: ChatbotBackgroundProps) {
  return (
    <SafeAreaView {...viewProps} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTopSpacing} />

          <View style={styles.headerBar}>
            <Pressable hitSlop={10} onPress={() => onBack?.()} style={styles.iconButton}>
              <BackIcon />
            </Pressable>

            <View style={styles.identityWrap}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>M</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.nameWrap}>
                <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable hitSlop={8} onPress={() => onCallPress?.()} style={styles.iconButton}>
                <CallChatbotIcon height={20} width={20} />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => onMenuPress?.()} style={styles.iconButton}>
                <ChatChatbotIcon height={21} width={21} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.contentContainer, contentContainerStyle]}>
          {children}
        </View>

        <View style={styles.composerWrap}>
          <View style={styles.composerBar}>
            <Pressable style={styles.composerIconLeft}>
              <SmileIcon />
            </Pressable>

            <Text style={styles.placeholderText}>Message</Text>

            <View style={styles.composerRightIcons}>
              <Pressable style={styles.trailingIconButton}>
                <AttachIcon />
              </Pressable>
              <Pressable style={styles.trailingIconButton}>
                <CameraIcon />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => onMicPress?.()} style={styles.micButton}>
            <MicrophoneIcon height={20} width={20} />
          </Pressable>
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
    backgroundColor: '#F6F6F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTopSpacing: {
    height: 28,
  },
  headerBar: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  avatarWrap: {
    width: 30,
    height: 30,
    marginRight: 9,
    justifyContent: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nameWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3F3F46',
  },
  subtitle: {
    marginTop: 1,
    fontSize: 11,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 9,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  composerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 19,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  composerBar: {
    flex: 1,
    minHeight: 44,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 8,
  },
  composerIconLeft: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  placeholderText: {
    flex: 1,
    fontSize: 13,
    color: '#A1A1AA',
  },
  composerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trailingIconButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C32A8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default ChatbotBackground;
