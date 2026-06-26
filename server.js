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

// 2. Ruta exacta corregida para recibir POST de Traccar Client
app.post('/api/posicion', async (req, res) => {
    try {
        // Traccar Client envía los datos en el cuerpo (body) mediante JSON
        const { id, lat, lon, speed, bearing } = req.body;

        // Validación de datos obligatorios
        if (!id || !lat || !lon) {
            console.log("📡 Petición POST vacía o incompleta recibida de Traccar.");
            return res.status(400).send('Faltan datos de ubicación (id, lat, lon)'); 
        }

        console.log(`📡 Datos guardados -> Grúa ID: ${id} | Lat: ${lat} | Lng: ${lon}`);

        // Guardar o actualizar en Firestore
        await setDoc(doc(db, "gruas", String(id)), {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            velocidad: parseFloat(speed || 0),
            orientacion: parseFloat(bearing || 0),
            ultimaActualizacion: serverTimestamp()
        }, { merge: true });

        // Traccar Client espera un código 200 OK para confirmar la recepción
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error al procesar la ubicación:', error);
        res.status(500).send('Error interno del servidor');
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
