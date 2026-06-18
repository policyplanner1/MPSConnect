import React, { useState } from 'react';
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
} from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

import NewHomePackImage from '../../../assets/images/newhomepack.svg';
import NhpAadharIcon from '../../../assets/images/bundleservicesicons/nhp-addhar.svg';
import NhpMsebIcon from '../../../assets/images/bundleservicesicons/nhp-mseb.svg';
import NhpPanIcon from '../../../assets/images/bundleservicesicons/nhp-pan.svg';
import NhpPropertyIcon from '../../../assets/images/bundleservicesicons/nhp-property.svg';
import NhpRentIcon from '../../../assets/images/bundleservicesicons/nhp-rent.svg';
import BundleBackgroundScreen from '../components/BundleBackgroundScreen';
import BundleButton from '../components/BundleButton';
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
  icon: 'rent' | 'mseb' | 'property' | 'aadhar' | 'pan';
};

const BUNDLE_ITEMS: BundleItem[] = [
  {
    id: 'rent-agreement',
    title: 'Rent Agreement Regist...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B91000',
    price: '\u20B9700',
    badge: 'Save 30%',
    icon: 'rent',
  },
  {
    id: 'mseb-name-change',
    title: 'MSEB Name Change',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B91500',
    price: '\u20B91200',
    badge: 'Save 30%',
    icon: 'mseb',
  },
  {
    id: 'property-tax-name-change',
    title: 'Property Tax Name Ch...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B94000',
    price: '\u20B93000',
    badge: 'Save 30%',
    icon: 'property',
  },
  {
    id: 'correction-aadhar',
    title: 'Correction in Aadhar C...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B9200',
    price: '\u20B9150',
    badge: 'Save 30%',
    icon: 'aadhar',
  },
  {
    id: 'correction-pan',
    title: 'Correction in PAN C...',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '\u20B9350',
    price: '\u20B9175',
    badge: 'Save 30%',
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

function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkSquare, checked ? styles.checkSquareChecked : styles.checkSquareUnchecked]}>
      {checked && (
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
      )}
    </View>
  );
}

function TrashIcon() {
  return (
    <View style={styles.deleteCircle}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
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
  const [checked, setChecked] = useState(false);

  const renderIcon = () => {
    if (icon === 'mseb') return <NhpMsebIcon width={44} height={44} />;
    if (icon === 'property') return <NhpPropertyIcon width={44} height={44} />;
    if (icon === 'aadhar') return <NhpAadharIcon width={44} height={44} />;
    if (icon === 'pan') return <NhpPanIcon width={44} height={44} />;
    return <NhpRentIcon width={44} height={44} />;
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.savePill}>
        <Text style={styles.savePillText}>{badge}</Text>
      </View>

      <Pressable style={styles.itemLeft} onPress={() => setChecked(prev => !prev)}>
        <CheckSquare checked={checked} />
      </Pressable>

      <View style={styles.itemIconWrap}>{renderIcon()}</View>

      <View style={styles.itemBody}>
        <Text numberOfLines={1} style={styles.itemTitle}>{title}</Text>

        <Text numberOfLines={2} style={styles.itemDescription}>
          {description}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>{oldPrice}</Text>
          <Text style={styles.newPrice}>{price}</Text>
        </View>
      </View>

      <View style={styles.itemDeleteBtn}>
        <TrashIcon />
      </View>
    </View>
  );
}

function FullPackageSection() {
  return (
    <View style={styles.fullPackageSection}>
      <View style={styles.bundleButtonSpacing}>
        <BundleButton
          label="Get the Full Package at"
          originalPrice="₹5,225"
          price="₹7,700"
        />
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

        <View style={styles.cartSummaryWrap}>
          <BundleButton label={'\u20B95,225+ \u2B50 673'} price="" />
        </View>
      </View>
    </View>
  );
}

function NewHomePackScreen({ onBack }: NewHomePackScreenProps) {
  const [activeTab, setActiveTab] = useState<'bundle' | 'individual'>('bundle');

  return (
    <BundleBackgroundScreen onBack={onBack}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <NewHomePackImage height={180} width="90%" />

          <View style={styles.heroTextOverlay}>
            <Text style={styles.heroTitle}>Update Property Tax Ownership Smoothly</Text>
          </View>

          <View style={styles.heroBulletsOverlay}>
            <Text style={styles.bulletText}>{'\u2022'} Accurate Filing.</Text>
            <Text style={styles.bulletText}>{'\u2022'} Trusted Support.</Text>
          </View>

          <View style={styles.heroShareRow}>
            <ShareIcon />
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segmentButton, activeTab === 'bundle' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('bundle')}>
            <Text style={[styles.segmentText, activeTab === 'bundle' && styles.segmentTextActive]}>
              Bundle Price
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, activeTab === 'individual' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('individual')}>
            <Text style={[styles.segmentText, activeTab === 'individual' && styles.segmentTextActive]}>
              Individual Price
            </Text>
          </Pressable>
        </View>

        <View style={styles.promoCard}>
          <BundleCard
            highlightText={activeTab === 'bundle' ? 'Flat \u20B9500 saved on this Bundle' : 'Save \u20B9200 more when bundled'}
            subtitle={activeTab === 'bundle' ? 'Special combo pricing unlocked' : 'Switch to Bundle Price for more savings'}
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
    backgroundColor: '#FFFFFF',
    position: 'relative',
    marginVertical: 14,
    overflow: 'hidden',
  },
  heroTextOverlay: {
    position: 'absolute',
    top: 18,
    right: 10,
    width: '48%',
  },
  heroBulletsOverlay: {
    position: 'absolute',
    bottom: 62,
    right: 14,
  },
  heroTitle: {
    fontSize: 17,
    lineHeight: 18,
    ...inter18('semiBold'),
    color: '#3E238D',
  },
  bulletGroup: {
    marginTop: 10,
    paddingLeft: 10,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 20,
    ...inter18('regular'),
    color: '#6D6A73',
  },
  heroShareRow: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  segmentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginTop: 2,
    padding: 3,
    borderRadius: 18,
    backgroundColor: '#F0EEEB',
  },
  segmentButton: {
    flex: 1,
    height: 30,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#111111',
  },
  segmentText: {
    fontSize: 11,
    ...inter18('medium'),
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
    marginTop: 14,
    marginHorizontal: 8,
    fontSize: 13,
    color: '#6D6A73',
  },
  itemList: {
    marginTop: 4,
    paddingHorizontal: 13,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE6F7',
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingBottom: 14,
    paddingLeft: 13,
    paddingRight: 10,
    marginBottom: 10,
    position: 'relative',
    minHeight: 110,
  },
  itemLeft: {
    marginRight: 10,
  },
  checkSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSquareChecked: {
    backgroundColor: '#4D8FFF',
  },
  checkSquareUnchecked: {
    borderWidth: 1.5,
    borderColor: '#C0B8CC',
    backgroundColor: '#FFFFFF',
  },
  itemIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F8F5FF',
    borderWidth: 1,
    borderColor: '#EFF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemBody: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 20,
    ...inter18('semiBold'),
    color: '#37323A',
    marginBottom: 4,
  },
  savePill: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 12,
    backgroundColor: '#F5EBFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savePillText: {
    fontSize: 11,
    ...inter18('bold'),
    color: '#A26BE8',
  },
  itemDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#7D7882',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  oldPrice: {
    fontSize: 12,
    color: '#929097',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  newPrice: {
    fontSize: 14,
    ...inter18('bold'),
    color: '#25A545',
  },
  itemDeleteBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  deleteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPackageSection: {
    marginHorizontal: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  bundleButtonSpacing: {
    marginBottom: 8,
    width: '96%',
    alignSelf: 'center',
  },
  saveLaterButton: {
    height: 44,
    width: '96%',
    alignSelf: 'center',
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
    ...inter18('bold'),
    color: '#3E238D',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0EDF9',
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 4,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    ...inter18('bold'),
    color: '#3E238D',
    marginBottom: 3,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: '#74618C',
    textAlign: 'center',
  },
  cartBar: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#7C3FCC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonText: {
    fontSize: 13,
    ...inter18('bold'),
    color: '#7C3FCC',
  },
  cartSummaryWrap: {
    flex: 1,
  },
});

export default NewHomePackScreen;
