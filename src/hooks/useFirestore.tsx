import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, QueryConstraint, Timestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseFirestoreOptions {
  collectionName: string;
  queryConstraints?: QueryConstraint[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

interface WithId {
  id: string;
}

export function useFirestore<T extends WithId = any & WithId>({
  collectionName,
  queryConstraints = [],
  orderByField,
  orderDirection = 'asc',
  limitCount,
}: UseFirestoreOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função de fetch extraída
  const fetchData = async () => {
    try {
      setLoading(true);
      let queryConstraintsArray = [...queryConstraints];
      if (orderByField) {
        queryConstraintsArray.push(orderBy(orderByField, orderDirection));
      }
      if (limitCount) {
        queryConstraintsArray.push(limit(limitCount));
      }
      const q = query(collection(db, collectionName), ...queryConstraintsArray);
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const processedData: Record<string, any> = {};
        Object.keys(data).forEach(key => {
          if (data[key] instanceof Timestamp) {
            processedData[key] = data[key].toDate();
          } else {
            processedData[key] = data[key];
          }
        });
        return {
          id: doc.id,
          ...processedData
        };
      }) as T[];
      setData(documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // CRUD: Adicionar documento
  const add = async (item: Omit<T, 'id'>) => {
    try {
      await addDoc(collection(db, collectionName), item);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar');
      throw err;
    }
  };

  // CRUD: Atualizar documento
  const update = async (id: string, item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, item as any);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
      throw err;
    }
  };

  // CRUD: Remover documento
  const remove = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [collectionName, orderByField, orderDirection, limitCount, JSON.stringify(queryConstraints)]);

  return { data, loading, error, add, update, remove };
}
