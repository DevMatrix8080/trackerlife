import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Data } from './store';
import { PW_MIN, pwStrong } from './password';

// Config Firebase (web): pubblica per design, la sicurezza sta nelle regole Firestore e in Auth.
const app = initializeApp({
  apiKey: 'INCOLLA_apiKey',
  authDomain: 'INCOLLA_authDomain',
  projectId: 'INCOLLA_projectId',
  appId: 'INCOLLA_appId',
});
const auth = getAuth(app);
const db = getFirestore(app);

const NAME_OK = /^[a-z0-9_.-]{3,20}$/;
const email = (n: string) => `${n}@mylife.app`; // email finta: Firebase vuole un'email, l'utente usa solo il nome

const ERR: Record<string, string> = {
  'auth/email-already-in-use': 'Utente già esistente',
  'auth/invalid-credential': 'Credenziali errate',
  'auth/user-not-found': 'Credenziali errate',
  'auth/wrong-password': 'Credenziali errate',
  'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
  'auth/network-request-failed': 'Nessuna connessione',
};

/** Ritorna un messaggio d'errore, oppure null se ok. */
export async function authenticate(rawName: string, pw: string, signup: boolean): Promise<string | null> {
  const name = rawName.trim().toLowerCase();
  if (!NAME_OK.test(name)) return 'Nome utente: 3-20 caratteri (lettere, numeri, _ . -)';
  if (!pw || pw.length > 200) return 'Password non valida';
  if (signup && !pwStrong(pw)) return `Password troppo debole: almeno ${PW_MIN} caratteri e 3 requisiti su 4`;
  try {
    await (signup ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, email(name), pw);
    return null;
  } catch (e) {
    return ERR[(e as { code?: string }).code ?? ''] ?? 'Errore, riprova';
  }
}

/** Chiama cb con il nome utente (o null) a ogni cambio di sessione; ritorna l'unsubscribe. */
export const onUser = (cb: (u: string | null) => void) =>
  onAuthStateChanged(auth, u => cb(u?.email ? u.email.split('@')[0] : null));

// Al logout si cancellano cache dati e residui del vecchio login locale: su un dispositivo condiviso non resta nulla.
export const logout = () => {
  try { Object.keys(localStorage).filter(k => /^(data:|users$|session$|locks$)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch { /* storage bloccato */ }
  return signOut(auth);
};

const ref = () => doc(db, 'users', auth.currentUser!.uid);
export const pull = async () => (await getDoc(ref())).data()?.d as Data | undefined;
export const push = (d: Data) => setDoc(ref(), { d: JSON.parse(JSON.stringify(d)) });
