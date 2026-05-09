import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
} from 'react-native-svg';

import NewHomePackImage from '../../../assets/images/newhomepack.svg';
import BundleBackgroundScreen from '../components/BundleBackgroundScreen';
import BundleCard from '../components/BundleCard';

type NewHomePackScreenProps = {
  onBack?: () => void;
};

type BundleItem = {
  id: string;
  title: string;
  description: string;
  oldPrice: string;
  price: string;
  badge: string;
  icon: 'document' | 'bolt' | 'aadhar' | 'pan';
};

const BUNDLE_ITEMS: BundleItem[] = [
  {
    id: 'rent-agreement',
    title: 'Rent Agreement Regist...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B9715',
    price: '\u20B9357',
    badge: 'Save 30%',
    icon: 'document',
  },
  {
    id: 'mseb-name-change',
    title: 'MSEB Name Change',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B9400',
    price: '\u20B9200',
    badge: 'Save 20%',
    icon: 'bolt',
  },
  {
    id: 'property-tax-name-change',
    title: 'Property Tax Name Ch...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B91400',
    price: '\u20B9700',
    badge: 'Save 30%',
    icon: 'document',
  },
  {
    id: 'correction-aadhar',
    title: 'Correction in Aadhar C...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B9120',
    price: '\u20B960',
    badge: 'Save 50%',
    icon: 'aadhar',
  },
  {
    id: 'correction-pan',
    title: 'Correction in PAN C...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B935',
    price: '\u20B917.5',
    badge: 'Save 20%',
    icon: 'pan',
  },
];

function ShareIcon() {
  return (
    <View style={styles.shareButton}>
      <Svg width={15} height={15} viewBox="0 0 24 24">
        <Circle cx="18" cy="5" r="2" fill="#8C8C95" />
        <Circle cx="6" cy="12" r="2" fill="#8C8C95" />
        <Circle cx="18" cy="19" r="2" fill="#8C8C95" />
        <Path
          d="M8 11L16 6.5M8 13L16 17.5"
          fill="none"
          stroke="#8C8C95"
          strokeLinecap="round"
          strokeWidth={1.6}
        />
      </Svg>
    </View>
  );
}

function DocumentIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Rect x="6" y="4" width="14" height="18" rx="2.5" fill="#FFFFFF" stroke="#D8DEE9" />
      <Path d="M17 4V9H22" fill="none" stroke="#D8DEE9" />
      <Rect x="9" y="12" width="9" height="1.7" rx="0.85" fill="#F2AE2E" />
      <Rect x="9" y="16" width="7" height="1.7" rx="0.85" fill="#7D9AF2" />
      <Rect x="3" y="18" width="14" height="6" rx="1.5" fill="#E7F0FF" />
      <Path d="M4 21H15" stroke="#9BB8FF" strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

function BoltIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M16.8 2.5L7.8 14.3H12.9L10.8 25.5L20.7 11.7H15.8L16.8 2.5Z"
        fill="#FDB72F"
        stroke="#F2A500"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </Svg>
  );
}

function AadharIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Rect x="4" y="6" width="20" height="16" rx="3" fill="#FFF4E7" stroke="#FFD89A" strokeWidth={1.4} />
      <Circle cx="10" cy="14" r="3" fill="#FF8A65" />
      <Path d="M15 12H20" stroke="#E1902A" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M15 16H19" stroke="#E1902A" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M7 20H21" stroke="#FFC470" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function PanCardIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Rect x="4" y="6" width="20" height="16" rx="3" fill="#F5EFF8" stroke="#D6BFED" strokeWidth={1.5} />
      <Path d="M8 11H20" stroke="#A678D2" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8 15H18" stroke="#A678D2" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8 19H16" stroke="#A678D2" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="10" cy="16" r="1.9" fill="#A678D2" />
    </Svg>
  );
}

function CheckSquare() {
  return (
    <View style={styles.checkSquare}>
      <Svg width={10} height={10} viewBox="0 0 24 24">
        <Path
          d="M5 12.5L9.3 17L19 7.5"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.8}
        />
      </Svg>
    </View>
  );
}

function TrashIcon() {
  return (
    <View style={styles.deleteCircle}>
      <Svg width={12} height={12} viewBox="0 0 24 24">
        <Path
          d="M8 9V17M12 9V17M16 9V17M5 6H19M9 6V4H15V6M7 6L8 19H16L17 6"
          fill="none"
          stroke="#FF7F7F"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
        />
      </Svg>
    </View>
  );
}

function BundleItemCard({
  title,
  description,
  oldPrice,
  price,
  badge,
  icon,
}: BundleItem) {
  const renderIcon = () => {
    if (icon === 'bolt') return <BoltIcon />;
    if (icon === 'aadhar') return <AadharIcon />;
    if (icon === 'pan') return <PanCardIcon />;
    return <DocumentIcon />;
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <CheckSquare />
      </View>

      <View style={styles.itemIconWrap}>{renderIcon()}</View>

      <View style={styles.itemBody}>
        <View style={styles.itemTopRow}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {title}
          </Text>
          <View style={styles.savePill}>
            <Text style={styles.savePillText}>{badge}</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.itemDescription}>
          {description}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>{oldPrice}</Text>
          <Text style={styles.newPrice}>{price}</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <TrashIcon />
      </View>
    </View>
  );
}

function FullPackageSection() {
  return (
    <View style={styles.fullPackageSection}>
      <View style={styles.fullPackageCard}>
        <Text style={styles.fullPackageTitle}>
          Get the Full Package at \u20B95,225 \u20B97,700
        </Text>
      </View>

      <Pressable style={styles.saveLaterButton}>
        <Text style={styles.saveLaterText}>Save for later</Text>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>20+ Trusted</Text>
          <Text style={styles.statLabel}>Insurance partners</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>15000+</Text>
          <Text style={styles.statLabel}>Insurance sold</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5+ Years</Text>
          <Text style={styles.statLabel}>of service expertise</Text>
        </View>
      </View>

      <View style={styles.cartBar}>
        <Pressable style={styles.addToCartButton}>
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </Pressable>

        <View style={styles.cartSummary}>
          <Text style={styles.cartAmount}>\u20B95,225</Text>
          <Text style={styles.cartRating}>{'45.25\u2605 673'}</Text>
        </View>
      </View>
    </View>
  );
}

function NewHomePackScreen({ onBack }: NewHomePackScreenProps) {
  return (
    <BundleBackgroundScreen onBack={onBack}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIllustrationWrap}>
              <NewHomePackImage height={112} width={148} />
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Update Property Tax Ownership Smoothly</Text>

              <View style={styles.bulletGroup}>
                <Text style={styles.bulletText}>{'\u2022'} Accurate Filing.</Text>
                <Text style={styles.bulletText}>{'\u2022'} Trusted Support.</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroShareRow}>
            <ShareIcon />
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <View style={[styles.segmentButton, styles.segmentButtonActive]}>
            <Text style={[styles.segmentText, styles.segmentTextActive]}>Bundle Price</Text>
          </View>
          <View style={styles.segmentButton}>
            <Text style={styles.segmentText}>Individual Price</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <BundleCard
            highlightText={'Flat \u20B9500 saved on this Bundle'}
            subtitle="Special combo pricing unlocked"
            titleSuffix=""
          />
        </View>

        <Text style={styles.selectionText}>Selected 5 items</Text>

        <View style={styles.itemList}>
          {BUNDLE_ITEMS.map(item => (
            <BundleItemCard key={item.id} {...item} />
          ))}
        </View>

        <FullPackageSection />
      </ScrollView>
    </BundleBackgroundScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 18,
  },
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E7E1D8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIllustrationWrap: {
    width: 156,
    height: 116,
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
    paddingTop: 2,
    paddingLeft: 8,
    paddingRight: 34,
  },
  heroTitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: '#3E238D',
  },
  bulletGroup: {
    marginTop: 10,
    paddingLeft: 10,
  },
  bulletText: {
    fontSize: 9.5,
    lineHeight: 20,
    color: '#6D6A73',
  },
  heroShareRow: {
    position: 'absolute',
    right: 2,
    bottom: 10,
  },
  segmentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginTop: 6,
    padding: 3,
    borderRadius: 18,
    backgroundColor: '#F0EEEB',
  },
  segmentButton: {
    flex: 1,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#111111',
  },
  segmentText: {
    fontSize: 10.5,
    fontWeight: '400',
    color: '#4B4747',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  promoCard: {
    marginHorizontal: 4,
    marginTop: 10,
  },
  selectionText: {
    marginTop: 8,
    marginHorizontal: 4,
    fontSize: 10,
    color: '#6D6A73',
  },
  itemList: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE6F7',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingLeft: 4,
    paddingRight: 6,
    marginBottom: 8,
  },
  itemLeft: {
    paddingTop: 2,
    marginRight: 6,
  },
  checkSquare: {
    width: 15,
    height: 15,
    borderRadius: 4,
    backgroundColor: '#4D8FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#EFF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemBody: {
    flex: 1,
    paddingTop: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemTitle: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#37323A',
    marginRight: 6,
  },
  savePill: {
    borderRadius: 4,
    backgroundColor: '#F5EBFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#A26BE8',
  },
  itemDescription: {
    marginTop: 2,
    fontSize: 8.5,
    lineHeight: 12,
    color: '#7D7882',
    paddingRight: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  oldPrice: {
    fontSize: 8.5,
    color: '#929097',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  newPrice: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#25A545',
  },
  itemRight: {
    justifyContent: 'flex-end',
    paddingLeft: 6,
    paddingBottom: 3,
  },
  deleteCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPackageSection: {
    marginHorizontal: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  fullPackageCard: {
    borderRadius: 6,
    backgroundColor: '#6F45E8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  fullPackageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  saveLaterButton: {
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CFC8E9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  saveLaterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E238D',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3E238D',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 8,
    lineHeight: 11,
    color: '#74618C',
    textAlign: 'center',
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E5F4',
  },
  addToCartButton: {
    flex: 1,
    height: 34,
    borderRadius: 4,
    backgroundColor: '#5D2BEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  addToCartButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cartSummary: {
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241360',
  },
  cartRating: {
    marginTop: 2,
    fontSize: 10,
    color: '#7A6B9C',
  },
});

export default NewHomePackScreen;
