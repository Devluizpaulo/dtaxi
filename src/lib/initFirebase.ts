import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const drivers = [
  {
    name: 'João Silva',
    status: 'online',
    rating: 4.8,
    location: {
      lat: -23.550520,
      lng: -46.633308
    },
    lastUpdate: Timestamp.now(),
    vehicleInfo: {
      model: 'Toyota Corolla',
      plate: 'ABC1234'
    }
  },
  {
    name: 'Maria Santos',
    status: 'busy',
    rating: 4.9,
    location: {
      lat: -23.557940,
      lng: -46.639190
    },
    lastUpdate: Timestamp.now(),
    vehicleInfo: {
      model: 'Honda Civic',
      plate: 'DEF5678'
    }
  },
  {
    name: 'Pedro Oliveira',
    status: 'offline',
    rating: 4.7,
    location: {
      lat: -23.548940,
      lng: -46.638820
    },
    lastUpdate: Timestamp.now(),
    vehicleInfo: {
      model: 'Volkswagen Golf',
      plate: 'GHI9012'
    }
  }
];

const trips = [
  {
    driverId: '', // Será preenchido após criar os motoristas
    status: 'in_progress',
    startTime: Timestamp.now(),
    origin: 'Av. Paulista, 1000',
    destination: 'Rua Augusta, 500',
    fare: 25.50
  },
  {
    driverId: '', // Será preenchido após criar os motoristas
    status: 'completed',
    startTime: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hora atrás
    endTime: Timestamp.now(),
    origin: 'Rua Oscar Freire, 1000',
    destination: 'Shopping Cidade São Paulo',
    fare: 35.75,
    rating: 5
  },
  {
    driverId: '', // Será preenchido após criar os motoristas
    status: 'pending',
    startTime: Timestamp.now(),
    origin: 'Av. Brigadeiro Faria Lima, 2000',
    destination: 'Rua Haddock Lobo, 400',
    fare: 30.00
  }
];

export async function initializeFirebaseData() {
  try {
    // Limpar coleções existentes (opcional)
    // await clearCollections();

    // Adicionar motoristas
    const driverRefs = await Promise.all(
      drivers.map(async (driver) => {
        const docRef = await addDoc(collection(db, 'drivers'), driver);
        return docRef.id;
      })
    );

    // Adicionar viagens com os IDs dos motoristas
    const tripsWithDrivers = trips.map((trip, index) => ({
      ...trip,
      driverId: driverRefs[index % driverRefs.length] // Distribui as viagens entre os motoristas
    }));

    await Promise.all(
      tripsWithDrivers.map(trip => 
        addDoc(collection(db, 'trips'), trip)
      )
    );

    console.log('Dados iniciais do Firebase configurados com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar dados iniciais:', error);
  }
}

// Função para limpar as coleções (opcional)
async function clearCollections() {
  const collections = ['drivers', 'trips'];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
} 