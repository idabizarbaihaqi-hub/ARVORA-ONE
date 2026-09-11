import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuthUser = auth ? auth.currentUser : null;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid ?? null,
      email: currentAuthUser?.email ?? null,
      emailVerified: currentAuthUser?.emailVerified ?? null,
      isAnonymous: currentAuthUser?.isAnonymous ?? null,
      tenantId: currentAuthUser?.tenantId ?? null,
      providerInfo: currentAuthUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function parseFirebaseErrorMessage(error: unknown): string {
  if (!error) return 'Terjadi kesalahan sistem yang tidak terduga.';
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('auth/invalid-email')) {
    return 'Format alamat email tidak valid.';
  }
  if (message.includes('auth/user-not-found') || message.includes('auth/wrong-password') || message.includes('auth/invalid-credential')) {
    return 'Email atau kata sandi yang Anda masukkan salah.';
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'Alamat email ini sudah terdaftar. Silakan login atau gunakan email lain.';
  }
  if (message.includes('auth/weak-password')) {
    return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi.';
  }
  if (message.includes('auth/network-request-failed')) {
    return 'Koneksi jaringan terputus. Mohon periksa sambungan internet Anda.';
  }
  if (message.includes('auth/too-many-requests')) {
    return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lagi.';
  }
  if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
    return 'Akses ditolak: Anda tidak memiliki izin untuk melihat atau mengubah data perusahaan ini.';
  }
  if (message.includes('unavailable') || message.includes('the client is offline')) {
    return 'Layanan cloud saat ini sedang offline atau belum terkonfigurasi.';
  }

  // Attempt to parse JSON error from handleFirestoreError
  try {
    const parsed = JSON.parse(message);
    if (parsed && parsed.error) {
      return `Kesalahan data (${parsed.operationType}): ${parsed.error}`;
    }
  } catch {
    // Not JSON
  }

  return message;
}
