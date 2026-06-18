import React, { useCallback, useState } from 'react';

import { fetchServiceDetails } from '../api/servicesApi';
import { mapDetailInfoToService } from '../utils/serviceNavigation';

import ChatbotStack from '../../chatbot/navigation/ChatbotStack';
import CalculatorsStack from '../../calculators/navigation/CalculatorsStack';
import HealthInsuranceStack from '../../healthInsurance/navigation/HealthInsuranceStack';
import OtherInsuranceStack from '../../otherInsurance/navigation/OtherInsuranceStack';
import NotificationScreen from '../../notifications/screens/NotificationScreen';
import RefereAndEarn from '../../rewards/screens/RefereAndEarn';
import RewardsHistoryScreen from '../../rewards/screens/RewardsHistoryScreen';
import CreateSupportTicketScreen from '../screens/CreateSupportTicketScreen';
import SupportOptionsScreen from '../screens/SupportOptionsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServiceCartScreen from '../screens/ServiceCartScreen';
import ServiceCheckoutScreen from '../screens/ServiceCheckoutScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import UploadDocuments from '../screens/UploadDocuments';
import { CheckoutPreviewData } from '../types/cart.types';
import { ServicesStackReturn } from '../types/navigation.types';
import { Service, ServiceDocument } from '../types/service.types';

const HEALTH_INSURANCE_ID = 12;

type ScreenState =
  | { name: 'Home'; openParentOrderId?: string }
  | { name: 'SupportOptions' }
  | { name: 'CreateSupportTicket' }
  | { name: 'HelpAndSupport' }
  | { name: 'Notifications' }
  | { name: 'Profile' }
  | { name: 'RewardHistory' }
  | { name: 'ReferAndEarn' }
  | { name: 'Calculators' }
  | { name: 'ServiceList'; categoryId: number; initialServiceId?: number }
  | { name: 'ServiceDetail'; serviceId: number; fromCategoryId?: number }
  | { name: 'ServiceCart'; returnTo: ServicesStackReturn }
  | {
      name: 'ServiceCheckout';
      preview: CheckoutPreviewData;
      cartReturnTo: ServicesStackReturn;
    }
  | {
      name: 'UploadDocuments';
      parentOrderId: string;
      orderId: string;
      checkoutDocuments?: ServiceDocument[];
      checkout: {
        preview: CheckoutPreviewData;
        cartReturnTo: ServicesStackReturn;
      };
    }
  | { name: 'HealthInsurance' }
  | { name: 'OtherInsurance'; serviceId: number; service: Service };

type ServicesStackProps = {
  onLogout?: () => void;
};

function goBackFromCart(
  returnTo: ServicesStackReturn,
  setScreen: React.Dispatch<React.SetStateAction<ScreenState>>,
) {
  if (returnTo.screen === 'home') {
    setScreen({ name: 'Home' });
    return;
  }
  setScreen({
    name: 'ServiceDetail',
    serviceId: returnTo.serviceId,
    fromCategoryId: returnTo.fromCategoryId,
  });
}

function ServicesStack({ onLogout }: ServicesStackProps) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Home' });
  const openNotifications = () => setScreen({ name: 'Notifications' });
  const openRewards = () => setScreen({ name: 'RewardHistory' });
  const openCartFromHome = () => setScreen({ name: 'ServiceCart', returnTo: { screen: 'home' } });

  const openServiceById = useCallback(async (serviceId: number) => {
    if (!serviceId || serviceId < 1) {
      return;
    }

    try {
      const { data } = await fetchServiceDetails(serviceId);
      const categoryId = data.service.category_id;
      const listService = mapDetailInfoToService(data.service);

      if (categoryId === 2) {
        if (serviceId === HEALTH_INSURANCE_ID) {
          setScreen({ name: 'HealthInsurance' });
          return;
        }
        setScreen({
          name: 'OtherInsurance',
          serviceId,
          service: listService,
        });
        return;
      }

      setScreen({
        name: 'ServiceList',
        categoryId,
        initialServiceId: serviceId,
      });
    } catch {
      setScreen({ name: 'ServiceDetail', serviceId });
    }
  }, []);

  const openSupportChat = () => setScreen({ name: 'HelpAndSupport' });
  const openSupportTicket = () => setScreen({ name: 'CreateSupportTicket' });
  const exitSupport = () => setScreen({ name: 'Home' });

  if (screen.name === 'SupportOptions') {
    return (
      <SupportOptionsScreen
        onBack={exitSupport}
        onCreateTicket={openSupportTicket}
        onChatWithAssistant={openSupportChat}
      />
    );
  }

  if (screen.name === 'CreateSupportTicket') {
    return (
      <CreateSupportTicketScreen
        onBack={exitSupport}
        onOpenChat={openSupportChat}
      />
    );
  }

  if (screen.name === 'HelpAndSupport') {
    return (
      <ChatbotStack
        onClose={exitSupport}
        onCreateTicket={openSupportTicket}
      />
    );
  }

  if (screen.name === 'Notifications') {
    return (
      <NotificationScreen
        onBack={() => setScreen({ name: 'Home' })}
        onOpenOrder={parentOrderId =>
          setScreen({ name: 'Home', openParentOrderId: parentOrderId })
        }
      />
    );
  }

  if (screen.name === 'Profile') {
    return (
      <ProfileScreen
        onBack={() => setScreen({ name: 'Home' })}
        onLogout={onLogout}
      />
    );
  }

  if (screen.name === 'RewardHistory') {
    return (
      <RewardsHistoryScreen
        onBack={() => setScreen({ name: 'Home' })}
        onReferNow={() => setScreen({ name: 'ReferAndEarn' })}
      />
    );
  }

  if (screen.name === 'ReferAndEarn') {
    return (
      <RefereAndEarn onBack={() => setScreen({ name: 'RewardHistory' })} />
    );
  }

  if (screen.name === 'Calculators') {
    return <CalculatorsStack onClose={() => setScreen({ name: 'Home' })} />;
  }

  if (screen.name === 'HealthInsurance') {
    return (
      <HealthInsuranceStack
        onBack={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
      />
    );
  }

  if (screen.name === 'OtherInsurance') {
    return (
      <OtherInsuranceStack
        onBack={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
        serviceId={screen.serviceId}
        service={screen.service}
      />
    );
  }

  if (screen.name === 'ServiceList') {
    const { categoryId, initialServiceId } = screen;
    return (
      <ServiceListScreen
        categoryId={categoryId}
        initialServiceId={initialServiceId}
        onBack={() => setScreen({ name: 'Home' })}
        onServicePress={(serviceId, service) => {
          if (categoryId === 2) {
            if (serviceId === HEALTH_INSURANCE_ID) {
              setScreen({ name: 'HealthInsurance' });
            } else {
              setScreen({ name: 'OtherInsurance', serviceId, service });
            }
          } else {
            setScreen({
              name: 'ServiceDetail',
              serviceId,
              fromCategoryId: categoryId,
            });
          }
        }}
      />
    );
  }

  if (screen.name === 'UploadDocuments') {
    return (
      <UploadDocuments
        parentOrderId={screen.parentOrderId}
        orderId={screen.orderId}
        checkoutDocuments={screen.checkoutDocuments}
        onBack={() =>
          setScreen({
            name: 'ServiceCheckout',
            preview: screen.checkout.preview,
            cartReturnTo: screen.checkout.cartReturnTo,
          })
        }
        onGoToOrders={() =>
          setScreen({
            name: 'ServiceCart',
            returnTo: screen.checkout.cartReturnTo,
          })
        }
      />
    );
  }

  if (screen.name === 'ServiceCheckout') {
    return (
      <ServiceCheckoutScreen
        preview={screen.preview}
        onBack={() =>
          setScreen({
            name: 'ServiceCart',
            returnTo: screen.cartReturnTo,
          })
        }
        onOpenNotifications={openNotifications}
        onProceedToUpload={({ orderId, parentOrderId, documents }) =>
          setScreen({
            name: 'UploadDocuments',
            parentOrderId,
            orderId,
            checkoutDocuments: documents,
            checkout: {
              preview: screen.preview,
              cartReturnTo: screen.cartReturnTo,
            },
          })
        }
      />
    );
  }

  if (screen.name === 'ServiceCart') {
    return (
      <ServiceCartScreen
        onBack={() => goBackFromCart(screen.returnTo, setScreen)}
        onOpenNotifications={openNotifications}
        onProceedToCheckout={preview =>
          setScreen({
            name: 'ServiceCheckout',
            preview,
            cartReturnTo: screen.returnTo,
          })
        }
      />
    );
  }

  if (screen.name === 'ServiceDetail') {
    return (
      <ServiceDetailScreen
        serviceId={screen.serviceId}
        onBack={() =>
          screen.fromCategoryId
            ? setScreen({ name: 'ServiceList', categoryId: screen.fromCategoryId })
            : setScreen({ name: 'Home' })
        }
        onOpenCart={() =>
          setScreen({
            name: 'ServiceCart',
            returnTo: {
              screen: 'serviceDetail',
              serviceId: screen.serviceId,
              fromCategoryId: screen.fromCategoryId,
            },
          })
        }
        onOpenNotifications={openNotifications}
        onOpenRewards={openRewards}
      />
    );
  }

  return (
    <HomeScreen
      initialRequestsParentOrderId={
        screen.name === 'Home' ? screen.openParentOrderId : undefined
      }
      onGetStarted={() => setScreen({ name: 'SupportOptions' })}
      onGovernmentDocuments={() =>
        setScreen({ name: 'ServiceList', categoryId: 3 })
      }
      onInsurancePress={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
      onOpenCart={openCartFromHome}
      onOpenNotifications={openNotifications}
      onOpenRewards={() => setScreen({ name: 'RewardHistory' })}
      onOpenCalculators={() => setScreen({ name: 'Calculators' })}
      onOpenProfile={() => setScreen({ name: 'Profile' })}
      onServicePress={serviceId => setScreen({ name: 'ServiceDetail', serviceId })}
      onOpenService={openServiceById}
      onLogout={onLogout}
    />
  );
}

export default ServicesStack;
