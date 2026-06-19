import { useState, useEffect } from 'react';
import {
  Service,
  ServiceDetailInfo,
  ServiceVariant,
  ServiceSection,
  ServiceDocument,
  EnquiryField,
} from '../types/service.types';
import { fetchServicesByCategory, fetchServiceDetails } from '../api/servicesApi';

export function useGovernmentServices(categoryId = 3) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchServicesByCategory(categoryId)
      .then(res => setServices(res.data.services ?? []))
      .catch(err => setError(err.message ?? 'Failed to load services'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return { services, loading, error };
}

export function useServiceDetails(serviceId: number) {
  const [service, setService] = useState<ServiceDetailInfo | null>(null);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [enquiryFields, setEnquiryFields] = useState<EnquiryField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchServiceDetails(serviceId)
      .then(res => {
        setService(res.data.service);
        setVariants(res.data.variants);
        setSections(res.data.service_sections);
        setDocuments(res.data.documents);
        setEnquiryFields(res.data.enquiry_fields);
      })
      .catch(err => setError(err.message ?? 'Failed to load service details'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  return { service, variants, sections, documents, enquiryFields, loading, error };
}
