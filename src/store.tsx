import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, Role, State, migrate, seed, transition } from './domain';
import { firebaseConfigured } from './firebase';
import { login, logout, registerEmployee, roleForUser, staffIdFromUser, watchAuth } from './auth';
const KEY = 'nrxn-demo-v1';
type Store = { state: State; role: Role | 'Visitor'; accountId: string; firebaseConfigured: boolean; signIn: (mode: 'Employee' | 'Administrator', id: string, password: string) => Promise<void>; signUp: (id: string, password: string) => Promise<void>; signOut: () => Promise<void>; ready: boolean; error: string; notice: string; clearNotice: () => void; act: (a: Action, message?: string) => Promise<boolean> };
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(seed); const current = useRef(state); const queue = useRef(Promise.resolve());
  const [role, setRole] = useState<Role | 'Visitor'>('Visitor'); const [accountId, setAccountId] = useState(''); const [storageReady, setStorageReady] = useState(false); const [authReady, setAuthReady] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const ready = storageReady && authReady;
  useEffect(() => { let mounted = true; AsyncStorage.getItem(KEY).then(async raw => { if (!mounted) return; if (raw) { const next = migrate(JSON.parse(raw)); current.current = next; setState(next); await AsyncStorage.setItem(KEY, JSON.stringify(next)); } setStorageReady(true); }).catch(() => { if (mounted) { setError('Saved data could not be loaded. Reload the app; existing data has not been overwritten.'); setStorageReady(true); } }); return () => { mounted = false; }; }, []);
  useEffect(() => watchAuth(user => { setRole(user ? roleForUser(user) : 'Visitor'); setAccountId(user ? staffIdFromUser(user) : ''); setAuthReady(true); }), []);
  const act = (a: Action, message = 'Saved on this device.') => new Promise<boolean>(resolve => { queue.current = queue.current.then(async () => { try { if (!ready) throw new Error('Storage is not ready.'); const next = transition(current.current, role, a); await AsyncStorage.setItem(KEY, JSON.stringify(next)); current.current = next; setState(next); setNotice(message); resolve(true); } catch (e) { setNotice(e instanceof Error ? e.message : 'Unable to save. Please try again.'); resolve(false); } }); });
  const signIn = async (mode: 'Employee' | 'Administrator', id: string, password: string) => { const user = await login(mode, id, password); setRole(roleForUser(user)); setAccountId(staffIdFromUser(user)); };
  const signUp = async (id: string, password: string) => { const user = await registerEmployee(id, password); setRole('MR'); setAccountId(staffIdFromUser(user)); };
  const signOut = async () => { await logout(); setRole('Visitor'); setAccountId(''); };
  return <Context.Provider value={{ state, role, accountId, firebaseConfigured, signIn, signUp, signOut, ready, error, notice, clearNotice: () => setNotice(''), act }}>{children}</Context.Provider>;
}
export function useStore() { const s = useContext(Context); if (!s) throw new Error('StoreProvider missing'); return s; }
