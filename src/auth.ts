import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, User } from 'firebase/auth';
import { auth, firebaseConfigured, requireFirebaseAuth } from './firebase';
import { Role } from './domain';

export const ADMIN_ID = 'MrBerzerk69';
const ADMIN_KEY = ADMIN_ID.toLowerCase();
const STAFF_DOMAIN = 'staff.nrxn.app';

export function normalizeStaffId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

export function staffEmail(id: string) {
  const normalized = normalizeStaffId(id);
  if (normalized.length < 3) throw new Error('Enter a valid employee ID with at least 3 characters.');
  return `${normalized}@${STAFF_DOMAIN}`;
}

export function staffIdFromUser(user: User) {
  return user.displayName || user.email?.split('@')[0] || 'Employee';
}

export function roleForUser(user: User): Role {
  return normalizeStaffId(staffIdFromUser(user)) === ADMIN_KEY ? 'Administrator' : 'MR';
}

function friendlyAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-credential')) return 'The employee ID or password is incorrect.';
  if (code.includes('email-already-in-use')) return 'This employee ID already has an account. Sign in instead.';
  if (code.includes('weak-password')) return 'Use a stronger password with at least 8 characters.';
  if (code.includes('network-request-failed')) return 'Unable to reach Firebase. Check your internet connection.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes and try again.';
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

export async function login(mode: 'Employee' | 'Administrator', id: string, password: string) {
  try {
    const normalized = normalizeStaffId(id);
    if (mode === 'Administrator' && normalized !== ADMIN_KEY) throw new Error('This ID is not registered as an administrator.');
    if (mode === 'Employee' && normalized === ADMIN_KEY) throw new Error('Use Administrator login for this account.');
    const credential = await signInWithEmailAndPassword(requireFirebaseAuth(), staffEmail(id), password);
    const role = roleForUser(credential.user);
    if ((mode === 'Administrator' && role !== 'Administrator') || (mode === 'Employee' && role === 'Administrator')) {
      await signOut(requireFirebaseAuth());
      throw new Error(`Use the ${role === 'Administrator' ? 'Administrator' : 'Employee'} login for this account.`);
    }
    return credential.user;
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function registerEmployee(id: string, password: string) {
  try {
    const normalized = normalizeStaffId(id);
    if (normalized === ADMIN_KEY) throw new Error('This ID is reserved for the administrator account.');
    if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
    const credential = await createUserWithEmailAndPassword(requireFirebaseAuth(), staffEmail(id), password);
    await updateProfile(credential.user, { displayName: id.trim() });
    return credential.user;
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export function watchAuth(callback: (user: User | null) => void) {
  if (!firebaseConfigured || !auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  if (auth) await signOut(auth);
}
