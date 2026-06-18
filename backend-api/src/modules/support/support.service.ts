import prisma from '../../config/prisma';
import { detectIntent } from './intent.service';

export const processSupportQuery = async (
  userId: number,
  message: string,
) => {
  const intent = detectIntent(message);

  let response = '';

  switch (intent) {
    case 'APPLICATION':
      response = 'Your application is currently under review.';
      break;

    case 'PAYMENT':
      response = 'Your payment status is being checked.';
      break;

    case 'KYC':
      response = 'Your KYC verification is in progress.';
      break;

    default:
      response = 'Please provide more details.';
      break;
  }

  await prisma.supportChatHistory.create({
    data: {
      userId,
      message,
      botResponse: response,
    },
  });

  return {
    success: true,
    response,
  };
};