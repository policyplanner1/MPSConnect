/**
 * DocVault personal storage — local Node API only (`DOCUMENTS_API_BASE_URL`).
 *
 * NOT used for service order / checkout document uploads.
 * Order flow uses `parentDocumentsApi.ts` (CRM `/parent-documents`, `/submit-documents`).
 */

export const DOC_VAULT_LOCAL_API_PATH = '/documents';
export const DOC_VAULT_UPLOAD_PATH = '/documents/upload';
