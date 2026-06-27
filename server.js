import express from 'express';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 10000; // Render asigna el puerto automáticamente

// 1. Configura tus credenciales de Firebase Web aquí
const firebaseConfig = {
  apiKey: "AIzaSyA9iDdqFnLFACBg3zH_BTy1ocIEahibVjs",
  authDomain: "ejemplo-crud-8c78a.firebaseapp.com",
  projectId: "ejemplo-crud-8c78a",
  storageBucket: "ejemplo-crud-8c78a.firebasestorage.app",
  messagingSenderId: "809437790985",
  appId: "1:809437790985:web:5670aa02d4fc7ed02809d8"
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middlewares necesarios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba para verificar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('🚀 Servidor de Grúas Corriendo en Render');
    console.log(req.body);
});

// 2. Ruta adaptada al formato real de tus logs (Transistor Background Geolocation)
app.get('/api/posicion', async (req, res) => {
    try {
        console.log("📦 Cuerpo recibido en el servidor:", JSON.stringify(req.body));

        // Transistor Software envía la información dentro del objeto 'location'
        const locationData = req.body.location || req.body;
        
        // Extraer los datos según la estructura real de esa librería
        // Nota: Esta librería usa 'uuid' o 'device_id' para identificar el teléfono
        const id = req.body.id || locationData.uuid || "dispositivo_desconocido";
        
        // Las coordenadas vienen dentro de un sub-objeto 'coords'
        const coords = locationData.coords || {};
        const lat = coords.latitude;
        const lon = coords.longitude;
        const speed = coords.speed || 0;
        const bearing = coords.heading || 0; // Se suele llamar heading en este plugin

        // Validación adaptada
        if (!lat || !lon) {
            console.log("📡 Petición POST recibida, pero no se encontraron coordenadas válidas.");
            // Esta librería exige un código 200 o 201 para saber que el servidor respondió con éxito
            return res.status(200).send({ success: false, message: "Faltan coordenadas" }); 
        }

        console.log(`📡 Datos procesados -> ID: ${id} | Lat: ${lat} | Lng: ${lon}`);

        // Guardar o actualizar en Firestore
        await setDoc(doc(db, "gruas", String(id)), {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            velocidad: parseFloat(speed),
            orientacion: parseFloat(bearing),
            ultimaActualizacion: serverTimestamp()
        }, { merge: true });

        // Responder con un formato JSON de éxito (muchas librerías lo exigen para limpiar su caché local)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al procesar la ubicación:', error);
        res.status(500).send('Error interno del servidor');
    }
});



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
