import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';

export type PickedVaultFile = {
  uri: string;
  name: string;
  type: string;
};

function mapPickedFile(file: {
  uri?: string | null;
  name?: string | null;
  type?: string | null;
}): PickedVaultFile | null {
  if (!file.uri) {
    return null;
  }

  const name = file.name?.trim() || `document-${Date.now()}.jpg`;
  return {
    uri: file.uri,
    name,
    type: file.type || 'application/octet-stream',
  };
}

function isUserCancelled(error: unknown): boolean {
  return isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED;
}

/** Opens device photo gallery / images picker. */
export async function pickVaultImageFromGallery(): Promise<PickedVaultFile | null> {
  try {
    const [file] = await pick({
      type: [types.images],
      allowMultiSelection: false,
      presentationStyle: 'fullScreen',
      mode: 'import',
    });
    return mapPickedFile(file);
  } catch (error) {
    if (isUserCancelled(error)) {
      return null;
    }
    throw error;
  }
}

/** Opens file browser for PDF and images. */
export async function pickVaultFileFromDevice(): Promise<PickedVaultFile | null> {
  try {
    const [file] = await pick({
      type: [types.pdf, types.images],
      allowMultiSelection: false,
      presentationStyle: 'fullScreen',
      mode: 'import',
    });
    return mapPickedFile(file);
  } catch (error) {
    if (isUserCancelled(error)) {
      return null;
    }
    throw error;
  }
}

export function vaultFileTitle(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || fileName;
}
