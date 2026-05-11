import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import TravelIcon from '../../../assets/images/bundleservicesicons/travel.svg';
import TravelInsuranceIcon from '../../../assets/images/bundleservicesicons/travel-insurance.svg';
import NhpPassportIcon from '../../../assets/images/bundleservicesicons/nhp-passport.svg';
import BundleBackgroundScreen from '../components/BundleBackgroundScreen';
import BundleButton from '../components/BundleButton';
import BundleCard from '../components/BundleCard';

type TravelPackScreenProps = {
  onBack?: () => void;
};

type TravelItem = {
  id: string;
  title: string;
  description: string;
  oldPrice: string;
  price: string;
  bundleBadge: string;
  icon: 'passport' | 'insurance';
};

const TRAVEL_ITEMS: TravelItem[] = [
  {
    id: 'passport',
    title: 'Passport',
    description: 'We handle everything from drafting and collecting doc...',
    oldPrice: '₹200',
    price: '₹150',
    bundleBadge: 'Save 30%',
    icon: 'passport',
  },
  {
    id: 'travel-insurance',
    title: 'Travel Insurance',
    description: 'Travel with confidence knowing you\'re protected wit...',
    oldPrice: '₹200',
    price: '₹150',
    bundleBadge: 'Save 30%',
    icon: 'insurance',
  },
];


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

type TravelItemCardProps = TravelItem & { activeTab: 'bundle' | 'individual' };

function TravelItemCard({ title, description, oldPrice, price, bundleBadge, icon, activeTab }: TravelItemCardProps) {
  const [checked, setChecked] = useState(false);

  const isIndividual = activeTab === 'individual';
  const pillLabel = isIndividual ? 'Save ₹200 more when bundled!' : bundleBadge;

  return (
    <View style={styles.itemCard}>
      <View style={[styles.savePill, isIndividual ? styles.savePillIndividual : styles.savePillBundle]}>
        <Text style={[styles.savePillText, isIndividual ? styles.savePillTextIndividual : styles.savePillTextBundle]}>
          {pillLabel}
        </Text>
      </View>

      <Pressable style={styles.itemLeft} onPress={() => setChecked(prev => !prev)}>
        <CheckSquare checked={checked} />
      </Pressable>

      <View style={styles.itemIconWrap}>
        {icon === 'insurance'
          ? <TravelInsuranceIcon width={44} height={44} />
          : <NhpPassportIcon width={44} height={44} />
        }
      </View>

      <View style={styles.itemBody}>
        <Text numberOfLines={1} style={styles.itemTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.itemDescription}>{description}</Text>
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
          <BundleButton label={'₹5,225+ ⭐ 673'} price="" />
        </View>
      </View>
    </View>
  );
}

function TravelPackScreen({ onBack }: TravelPackScreenProps) {
  const [activeTab, setActiveTab] = useState<'bundle' | 'individual'>('individual');

  return (
    <BundleBackgroundScreen onBack={onBack} title="Travel Set Up Pack">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <TravelIcon width="100%" height={180} />
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
            highlightText={activeTab === 'bundle' ? 'Flat ₹500 saved on this Bundle' : 'Save ₹200 more when bundled'}
            subtitle={activeTab === 'bundle' ? 'Special combo pricing unlocked' : 'Switch to Bundle Price for more savings'}
            titleSuffix=""
          />
        </View>

        <Text style={styles.selectionText}>Selected 2 items</Text>

        <View style={styles.itemList}>
          {TRAVEL_ITEMS.map(item => (
            <TravelItemCard key={item.id} {...item} activeTab={activeTab} />
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    marginVertical: 14,
    overflow: 'hidden',
  },
  segmentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginTop: 0,
    padding: 3,
    borderRadius: 18,
    backgroundColor: '#F0EEEB',
  },
  segmentButton: {
    flex: 1,
    height: 32,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#111111',
  },
  segmentText: {
    fontSize: 12,
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
    marginTop: 12,
    marginHorizontal: 10,
    fontSize: 13,
    color: '#6D6A73',
  },
  itemList: {
    marginTop: 4,
    paddingHorizontal: 10,
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
    paddingLeft: 10,
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
    color: '#37323A',
    marginBottom: 4,
  },
  savePill: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  savePillBundle: {
    backgroundColor: '#F5EBFF',
  },
  savePillIndividual: {
    backgroundColor: '#FFF3E0',
  },
  savePillText: {
    fontSize: 10,
  },
  savePillTextBundle: {
    color: '#A26BE8',
  },
  savePillTextIndividual: {
    color: '#F97316',
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
    color: '#7C3FCC',
  },
  cartSummaryWrap: {
    flex: 1,
  },
});

export default TravelPackScreen;
