/** Where to return after leaving the cart or checkout flow. */
export type ServicesStackReturn =
  | { screen: 'home' }
  | { screen: 'serviceDetail'; serviceId: number; fromCategoryId?: number };
