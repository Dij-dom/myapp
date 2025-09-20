'use server';

import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import type { DailyPlan } from './types';

const dbRef = ref(database);

export async function savePlan(userId: string, plan: DailyPlan | null) {
  try {
    await set(ref(database, `plans/${userId}`), plan);
  } catch (error) {
    console.error("Error saving plan to database:", error);
    throw new Error("Could not save plan.");
  }
}

export async function getPlan(userId: string): Promise<DailyPlan | null> {
  try {
    const snapshot = await get(child(dbRef, `plans/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting plan from database:", error);
    return null;
  }
}
