import React from 'react';
import type { SvgProps } from 'react-native-svg';

import AdharCardIcon from '../../../assets/images/adhar card.svg';
import BirthCertificateIcon from '../../../assets/images/birth cetificate.svg';
import CarIcon from '../../../assets/images/Car.svg';
import CasteCertificateIcon from '../../../assets/images/caste certificate.svg';
import DeathCertificateIcon from '../../../assets/images/death cetificate.svg';
import DomicileIcon from '../../../assets/images/domicile.svg';
import IncomeCertificateIcon from '../../../assets/images/income cetificate.svg';
import IncomeTaxReplyIcon from '../../../assets/images/income tax reply.svg';
import ItrFilingIcon from '../../../assets/images/ITR File.svg';
import MarriageIcon from '../../../assets/images/marriage.svg';
import PanCardIcon from '../../../assets/images/pan card.svg';
import PassportIcon from '../../../assets/images/passport.svg';
import PropertyTaxIcon from '../../../assets/images/Property Tax.svg';
import RationCardIcon from '../../../assets/images/ration card.svg';
import RentAgreementIcon from '../../../assets/images/rent aggrement.svg';
import SeniorCitizenCertificateIcon from '../../../assets/images/senior citizen cetificate.svg';
import TwoWheelIcon from '../../../assets/images/2 wheel.svg';
import TwoFourWheelIcon from '../../../assets/images/two&four wheel.svg';
import VoterIdIcon from '../../../assets/images/icons/id-card_gd.svg';
import type { ExploreServiceIconKey } from './exploreData';

export type ExploreSvgIcon = React.FC<SvgProps>;

const EXPLORE_SERVICE_ICONS: Record<ExploreServiceIconKey, ExploreSvgIcon> = {
  itrFiling: ItrFilingIcon,
  propertyTaxNameCertificate: PropertyTaxIcon,
  incomeTaxReply: IncomeTaxReplyIcon,
  aadhar: AdharCardIcon,
  pan: PanCardIcon,
  voterId: VoterIdIcon,
  passport: PassportIcon,
  rationCard: RationCardIcon,
  twoWheelLicense: TwoWheelIcon,
  twoFourWheelLicense: TwoFourWheelIcon,
  seniorCitizenCertificate: SeniorCitizenCertificateIcon,
  birthCertificate: BirthCertificateIcon,
  deathCertificate: DeathCertificateIcon,
  marriageCertificate: MarriageIcon,
  domicileCertificate: DomicileIcon,
  casteCertificate: CasteCertificateIcon,
  incomeCertificate: IncomeCertificateIcon,
  drivingLicence: CarIcon,
  rentAgreement: RentAgreementIcon,
};

export function resolveExploreServiceIcon(
  iconKey?: ExploreServiceIconKey,
): ExploreSvgIcon | null {
  if (!iconKey) {
    return null;
  }
  return EXPLORE_SERVICE_ICONS[iconKey] ?? null;
}
