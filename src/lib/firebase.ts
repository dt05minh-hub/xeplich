import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Support custom databaseId if configured in firebase-applet-config.json
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const DEFAULT_SYNC_KEY = 'default-planner';

export interface SyncDataPayload {
  events?: any[];
  tasks?: any[];
  workConstraints?: any[];
  timeTrackSessions?: any[];
  userProfile?: any;
  weeklyReport?: any;
  monthlyReport?: any;
  feedbackLogs?: any[];
  categories?: any[];
  subCategories?: any[];
  notifications?: any;
  updatedAt?: any;
  deviceId?: string;
}

/**
 * Save planner data to Firestore in real-time
 */
export async function savePlannerToCloud(syncKey: string, payload: SyncDataPayload, deviceId: string) {
  if (!syncKey) return;
  try {
    const docRef = doc(db, 'planners', syncKey.trim().toLowerCase());
    await setDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
      deviceId,
    }, { merge: true });
  } catch (error) {
    console.error('Error saving to Firebase Firestore:', error);
  }
}

/**
 * Subscribe to real-time changes on Firestore
 */
export function subscribeToPlannerCloud(
  syncKey: string, 
  onData: (data: SyncDataPayload & { deviceId?: string; updatedAt?: any }) => void
) {
  if (!syncKey) return () => {};
  const docRef = doc(db, 'planners', syncKey.trim().toLowerCase());

  const unsubscribe = onSnapshot(
    docRef, 
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SyncDataPayload;
        onData(data);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
    }
  );

  return unsubscribe;
}

/**
 * Fetch planner data once from cloud
 */
export async function fetchPlannerFromCloud(syncKey: string) {
  if (!syncKey) return null;
  try {
    const docRef = doc(db, 'planners', syncKey.trim().toLowerCase());
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as SyncDataPayload;
    }
  } catch (error) {
    console.error('Error fetching from Firebase Firestore:', error);
  }
  return null;
}
