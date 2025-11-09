
import { ref, get, update, type Database, set } from 'firebase/database';

export type Feature = 
  | 'co-working-room'
  | 'document-intelligence'
  | 'startup-generator'
  | 'invoice-generator'
  | 'email-generator'
  | 'accounting-ai';

export const DAILY_FREE_CREDITS = 50;

export const getCreditCost = (feature: Feature): number => {
  switch (feature) {
    case 'co-working-room': return 2;
    case 'document-intelligence': return 5;
    case 'startup-generator': return 5;
    case 'invoice-generator': return 2;
    case 'email-generator': return 5;
    case 'accounting-ai': return 5;
    default: return 0;
  }
};

type UserProfile = {
  credits: number;
  creditsLastReset: string;
  email?: string;
};

export async function getUserCredits(db: Database, userId: string): Promise<number> {
  const userRef = ref(db, `users/${userId}`);
  const userSnap = await get(userRef);

  if (!userSnap.exists()) {
    const newUserProfile = { 
        credits: DAILY_FREE_CREDITS, 
        creditsLastReset: new Date().toISOString() 
    };
    await set(userRef, newUserProfile);
    return DAILY_FREE_CREDITS;
  }

  const userData = userSnap.val() as UserProfile;
  const { credits, creditsLastReset, email } = userData;

  // Special one-time credit grant for Nithin
  if (email === 'mnithin061@gmail.com' && credits < 100) {
      await update(userRef, { credits: 100 });
      return 100;
  }

  // Handle cases where creditsLastReset might not exist for older users
  if (!creditsLastReset) {
      const updatedProfile = { credits: DAILY_FREE_CREDITS, creditsLastReset: new Date().toISOString() };
      await update(userRef, updatedProfile);
      return DAILY_FREE_CREDITS;
  }

  const lastReset = new Date(creditsLastReset);
  const now = new Date();
  
  const lastResetDate = lastReset.toDateString();
  const todayDate = now.toDateString();

  if (lastResetDate !== todayDate) {
    // Reset credits
    const updatedProfile = { credits: DAILY_FREE_CREDITS, creditsLastReset: now.toISOString() };
    await update(userRef, updatedProfile);
    return DAILY_FREE_CREDITS;
  }

  return credits;
}

export async function deductCredits(db: Database, userId: string, feature: Feature): Promise<{ success: boolean; newBalance?: number, cost: number }> {
  const userRef = ref(db, `users/${userId}`);
  const cost = getCreditCost(feature);
  
  try {
    const currentCredits = await getUserCredits(db, userId);

    if (currentCredits < cost) {
      return { success: false, cost };
    }

    const newBalance = currentCredits - cost;
    const updatedProfile = { credits: newBalance };
    
    await update(userRef, updatedProfile);

    return { success: true, newBalance, cost };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return { success: false, cost };
  }
}
