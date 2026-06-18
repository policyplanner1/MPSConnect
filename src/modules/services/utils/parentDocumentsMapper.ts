import type { ParentOrderDocument } from '../types/parentDocuments.types';
import type { ServiceDocument } from '../types/service.types';

function toDocumentKey(documentName: string, id: number): string {
  const key = documentName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || `document_${id}`;
}

export function mapServiceDocumentsToParentDocuments(
  documents: ServiceDocument[],
): ParentOrderDocument[] {
  return documents.map(doc => ({
    document_key: toDocumentKey(doc.document_name, doc.id),
    document_name: doc.document_name,
    is_mandatory: doc.is_mandatory === 1,
    is_expirable: false,
    uploaded: false,
    expiry_date: null,
    document_number: null,
    file_url: null,
  }));
}
