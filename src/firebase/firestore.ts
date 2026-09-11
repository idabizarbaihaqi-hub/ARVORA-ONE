import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import type { Company, UserProfile, CompanyUser } from '../types';

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    // Attempt connection check
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or misconfigured.');
    }
    return false;
  }
}

export async function getCompany(companyId: string): Promise<Company | null> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');
  const docRef = doc(db, 'companies', companyId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Company;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `companies/${companyId}`);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');
  const docRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

export async function getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');
  try {
    const q = query(collection(db, 'companyUsers'), where('companyId', '==', companyId));
    const querySnapshot = await getDocs(q);
    const users: CompanyUser[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as CompanyUser);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'companyUsers');
  }
}

export async function updateCompanyDetails(
  companyId: string,
  updates: Partial<Pick<Company, 'name' | 'industry' | 'businessType' | 'phone' | 'address'>>
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');
  const docRef = doc(db, 'companies', companyId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'fullName' | 'phoneNumber'>>
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');
  const docRef = doc(db, 'users', userId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function createTenantData(
  companyData: Company,
  userProfile: UserProfile,
  companyUser: CompanyUser
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');

  // Create Company document
  try {
    await setDoc(doc(db, 'companies', companyData.id), companyData);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `companies/${companyData.id}`);
  }

  // Create User profile document
  try {
    await setDoc(doc(db, 'users', userProfile.id), userProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${userProfile.id}`);
  }

  // Create CompanyUser relation document
  try {
    await setDoc(doc(db, 'companyUsers', companyUser.id), companyUser);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `companyUsers/${companyUser.id}`);
  }
}
