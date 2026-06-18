/** @typedef {'default' | 'muted' | 'info' | 'success' | 'error'} NotificationVariant */

/**
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} timestamp
 * @property {NotificationVariant} variant
 * @property {boolean} [read]
 * @property {'passport' | null} [thumbnail]
 */

/** @type {AppNotification[]} */
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New govt scheme alerts 🔥',
    body: 'Check eligibility for benefits and subsidies available in your state.',
    timestamp: 'Now',
    variant: 'default',
    read: false,
  },
  {
    id: '2',
    title: 'Your vault is empty 📁',
    body: 'Upload PAN, Aadhaar, or passport copies to keep documents handy.',
    timestamp: 'Now',
    variant: 'muted',
    read: true,
  },
  {
    id: '3',
    title: 'Incomplete application ⚠️',
    body: 'You left your PAN correction request unfinished. Resume anytime.',
    timestamp: 'Now',
    variant: 'default',
    read: true,
  },
  {
    id: '4',
    title: 'Payment received ✔️',
    body: 'We received ₹499 for your Passport application. Receipt is in My requests.',
    timestamp: 'Now',
    variant: 'default',
    read: true,
  },
  {
    id: '5',
    title: 'Document dispatched 🚚',
    body: 'Your verified passport copy is on the way to your registered address.',
    timestamp: 'Now',
    variant: 'info',
    read: true,
  },
  {
    id: '6',
    title: 'Out for delivery 📦',
    body: 'Courier partner will deliver today between 2 PM and 6 PM.',
    timestamp: 'Now',
    variant: 'info',
    read: true,
  },
  {
    id: '7',
    title: 'Document delivered 🎁',
    body: 'Your Aadhaar update kit was delivered successfully.',
    timestamp: 'Now',
    variant: 'success',
    read: true,
  },
  {
    id: '8',
    title: 'Request cancelled ❌',
    body: 'Your driving licence renewal request was cancelled. Refund in 5–7 days.',
    timestamp: 'Now',
    variant: 'error',
    read: true,
  },
  {
    id: '9',
    title: 'Fresh offers today 💰',
    body: 'Bundle passport + PAN services and save on processing fees.',
    timestamp: 'Now',
    variant: 'default',
    read: true,
  },
  {
    id: '10',
    title: 'We missed you 💛',
    body: 'Pick up where you left off — your saved services are waiting.',
    timestamp: 'Now',
    variant: 'default',
    read: true,
  },
  {
    id: '11',
    title: 'Service completed',
    body: 'Your passport application was submitted successfully.',
    timestamp: '1 day ago',
    variant: 'default',
    thumbnail: 'passport',
    read: true,
  },
];

/**
 * @returns {Promise<AppNotification[]>}
 */
export async function fetchNotifications() {
  await new Promise(resolve => setTimeout(resolve, 80));
  return MOCK_NOTIFICATIONS.map(item => ({ ...item }));
}

export { MOCK_NOTIFICATIONS };
