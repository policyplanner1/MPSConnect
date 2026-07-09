import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getCrmEnquiryUserId } from '../../../core/utils/crmUserSession';
import {
  getServicePaymentErrorMessage,
  runCheckoutPaymentFlow,
} from '../api/servicePaymentApi';
import { getCheckoutPreviewItems } from '../api/serviceCartApi';
import { CheckoutPreviewData } from '../types/cart.types';
import { CheckoutPaymentSuccess } from '../types/payment.types';

export type PaymentPhase = 'idle' | 'placing' | 'paying' | 'verifying';

export function useCheckoutPayment() {
  const [phase, setPhase] = useState<PaymentPhase>('idle');

  const payAndProceed = useCallback(
    async (params: {
      preview: CheckoutPreviewData;
      itemCount: number;
      orderLabel: string;
      addressId: number;
    }): Promise<CheckoutPaymentSuccess | null> => {
      const userId = await getCrmEnquiryUserId();
      if (userId == null) {
        Alert.alert(
          'Checkout',
          'CRM user id is not available. Please log in again or set CRM_ENQUIRY_USER_ID in .env.',
        );
        return null;
      }

      const isBuyNow = params.preview.type === 'buy_now';
      const target = params.preview.buy_now_target;

      setPhase('placing');
      try {
        setPhase('paying');
        const lines = getCheckoutPreviewItems(params.preview);
        const singleCartLine =
          !isBuyNow && lines.length === 1
            ? { serviceId: lines[0].service_id, variantId: lines[0].variant_id }
            : undefined;

        const result = await runCheckoutPaymentFlow({
          userId,
          addressId: params.addressId,
          itemCount: params.itemCount,
          isBuyNow,
          buyNowServiceId: target?.service_id,
          buyNowVariantId: target?.variant_id,
          singleCartLine,
          orderLabel: params.orderLabel,
        });

        setPhase('verifying');
        setPhase('idle');
        return result;
      } catch (err) {
        setPhase('idle');
        const message = getServicePaymentErrorMessage(err);
        if (message !== 'Payment cancelled.') {
          Alert.alert('Payment', message);
        }
        return null;
      }
    },
    [],
  );

  const paying = phase !== 'idle';

  const statusLabel =
    phase === 'placing'
      ? 'Creating your order…'
      : phase === 'paying'
        ? 'Opening payment…'
        : phase === 'verifying'
          ? 'Confirming payment…'
          : '';

  return { payAndProceed, paying, phase, statusLabel };
}
