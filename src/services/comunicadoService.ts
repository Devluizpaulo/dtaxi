import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Comunicado } from "@/components/dashboard/coordination/types";

const COLLECTION = "comunicados";

export async function getComunicados(): Promise<Comunicado[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comunicado));
}

export async function addComunicado(comunicado: Omit<Comunicado, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...comunicado,
    data: comunicado.data ? comunicado.data : Timestamp.now(),
  });
  return docRef.id;
}

export async function updateComunicado(id: string, comunicado: Partial<Comunicado>): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, comunicado);
}

export async function deleteComunicado(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
} 