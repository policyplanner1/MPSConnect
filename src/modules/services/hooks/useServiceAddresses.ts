import { useCallback, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createServiceAddress,
  deleteServiceAddress,
  fetchServiceAddresses,
  getServiceAddressErrorMessage,
  setDefaultServiceAddress,
  updateServiceAddress,
} from '../api/serviceAddressApi';
import type { ServiceAddress, ServiceAddressInput } from '../types/serviceAddress.types';

const SELECTED_ADDRESS_KEY = 'service_selected_address_id';

type UseServiceAddressesResult = {
  addresses: ServiceAddress[];
  selectedAddress: ServiceAddress | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectAddress: (addressId: number) => Promise<void>;
  saveAddress: (input: ServiceAddressInput, addressId?: number) => Promise<ServiceAddress>;
  removeAddress: (addressId: number) => Promise<void>;
};

export function useServiceAddresses(): UseServiceAddressesResult {
  const [addresses, setAddresses] = useState<ServiceAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistSelectedId = useCallback(async (addressId: number) => {
    setSelectedAddressId(addressId);
    await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, String(addressId));
  }, []);

  const pickInitialSelection = useCallback(
    async (list: ServiceAddress[]) => {
      if (list.length === 0) {
        setSelectedAddressId(null);
        await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
        return;
      }

      const stored = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
      const storedId = stored ? Number(stored) : null;
      const storedMatch =
        storedId && list.some(address => address.id === storedId)
          ? list.find(address => address.id === storedId) ?? null
          : null;
      const defaultAddress = list.find(address => address.isDefault) ?? list[0];
      const next = storedMatch ?? defaultAddress;
      setSelectedAddressId(next.id);
      await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, String(next.id));
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchServiceAddresses();
      setAddresses(list);
      setError(null);
      await pickInitialSelection(list);
    } catch (err) {
      setError(getServiceAddressErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pickInitialSelection]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectAddress = useCallback(
    async (addressId: number) => {
      await persistSelectedId(addressId);
      try {
        const updated = await setDefaultServiceAddress(addressId);
        setAddresses(prev =>
          prev.map(address => ({
            ...address,
            isDefault: address.id === updated.id,
          })),
        );
      } catch {
        // Selection still works locally even if default sync fails.
      }
    },
    [persistSelectedId],
  );

  const saveAddress = useCallback(
    async (input: ServiceAddressInput, addressId?: number) => {
      setSaving(true);
      try {
        const saved = addressId
          ? await updateServiceAddress(addressId, input)
          : await createServiceAddress(input);

        setAddresses(prev => {
          const without = prev.filter(address => address.id !== saved.id);
          const next = [...without, saved].sort((a, b) => {
            if (a.isDefault !== b.isDefault) {
              return a.isDefault ? -1 : 1;
            }
            return b.id - a.id;
          });
          return next;
        });
        await persistSelectedId(saved.id);
        setError(null);
        return saved;
      } catch (err) {
        const message = getServiceAddressErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [persistSelectedId],
  );

  const removeAddress = useCallback(
    async (addressId: number) => {
      await deleteServiceAddress(addressId);
      const list = await fetchServiceAddresses();
      setAddresses(list);
      await pickInitialSelection(list);
    },
    [pickInitialSelection],
  );

  const selectedAddress = useMemo(
    () => addresses.find(address => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  return {
    addresses,
    selectedAddress,
    loading,
    saving,
    error,
    refresh,
    selectAddress,
    saveAddress,
    removeAddress,
  };
}
