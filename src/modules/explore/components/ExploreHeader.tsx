import React from 'react';

import HomeHeroHeader from '../../services/components/HomeHeroHeader';

type ExploreHeaderProps = {
  userName?: string;
  userInitials?: string;
  profileImageUri?: string | null;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
};

export default function ExploreHeader({
  userName = 'Kiran',
  userInitials = 'K',
  profileImageUri = null,
  notificationCount = 1,
  onNotificationPress,
  onProfilePress,
}: ExploreHeaderProps) {
  return (
    <HomeHeroHeader
      profileInitials={userInitials}
      profileImageUri={profileImageUri}
      userName={userName}
      greeting="Hello!"
      notificationCount={notificationCount}
      onNotificationPress={onNotificationPress}
      onProfilePress={onProfilePress}
      showCart={false}
      showHeroCopy={false}
      showHeroCurve={false}
      showChatIcon={false}
      heroBackgroundColor="transparent"
    />
  );
}
