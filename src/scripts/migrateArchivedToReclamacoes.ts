import { getDocs, collection, doc, setDoc, getDoc, deleteDoc, initializeFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function migrateArchivedToReclamacoes() {
  const arquivadasSnap = await getDocs(collection(db, 'reclamacoes-arquivadas'));
  let migrated = 0;
  let skipped = 0;
  for (const docSnap of arquivadasSnap.docs) {
    const data = docSnap.data();
    const targetRef = doc(db, 'reclamacoes', docSnap.id);
    const exists = await getDoc(targetRef);
    if (!exists.exists()) {
      await setDoc(targetRef, { ...data, status: 'pendente', dataArquivamento: null }, { merge: true });
      migrated++;
    } else {
      skipped++;
    }
    await deleteDoc(doc(db, 'reclamacoes-arquivadas', docSnap.id));
  }
  console.log(`Migração concluída! Migrados: ${migrated}, Ignorados (já existiam): ${skipped}`);
}

migrateArchivedToReclamacoes().catch(console.error); 