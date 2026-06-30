import express from 'express';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Configura tus credenciales de Firebase usando variables de entorno (Recomendado en Render)
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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor de Grúas Corriendo en Render');
});

// Función lógica reutilizable para procesar los datos
const procesarUbicacion = async (req, res) => {
    try {
        // Soporta tanto POST (body) como GET (query)
        const datos = (Object.keys(req.body).length > 0) ? req.body : req.query;

        console.log("📦 Datos recibidos en el servidor:", JSON.stringify(datos));

        const id = datos.id || "dispositivo_desconocido";
        const lat = datos.lat;
        const lon = datos.lon;
        const speed = datos.speed || 0;
        const bearing = datos.bearing || 0;

        if (!lat || !lon) {
            console.log("📡 Petición recibida, pero faltan coordenadas válidas.");
            return res.status(200).send({ success: false, message: "Faltan coordenadas" }); 
        }

        console.log(`📡 Datos procesados -> ID: ${id} | Lat: ${lat} | Lng: ${lon}`);

        // Guardar en Firestore
        await setDoc(doc(db, "gruas", String(id)), {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            velocidad: parseFloat(speed),
            orientacion: parseFloat(bearing),
            ultimaActualizacion: serverTimestamp()
        }, { merge: true });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al procesar la ubicación:', error);
        res.status(500).send('Error interno del servidor');
    }
};

// 2. Definición correcta de rutas separadas apuntando a la misma función
app.get('/api/posicion', procesarUbicacion);
app.post('/api/posicion', procesarUbicacion);

// Escuchar en el puerto asignado por Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
