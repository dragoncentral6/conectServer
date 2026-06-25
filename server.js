import express from 'express';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 3000; // Render asigna el puerto automáticamente

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
});

// 2. Ruta exacta donde Traccar Client enviará los datos
app.get('/api/posicion', async (req, res) => {
    try {
        // Traccar Client envía los datos como parámetros Query en la URL
        const { id, lat, lon, speed, bearing } = req.query;

        if (!id || !lat || !lon) {
            return res.status(400).send('Faltan parámetros obligatorios (id, lat, lon)');
        }

        console.log(`📡 Datos recibidos de la Grúa ID: ${id} -> Lat: ${lat}, Lng: ${lon}`);

        // 3. Guardar directamente en Firestore en la colección 'gruas'
        await setDoc(doc(db, "gruas", id), {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            velocidad: parseFloat(speed || 0),
            orientacion: parseFloat(bearing || 0),
            ultimaActualizacion: serverTimestamp()
        }, { merge: true });

        // Responderle OK a la app Traccar
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error al procesar la ubicación:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});