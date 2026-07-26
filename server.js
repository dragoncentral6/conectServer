import express from 'express';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Configura tus credenciales de Firebase usando variables de entorno (Recomendado en Render)
const firebaseConfig = {
  apiKey: "AIzaSyAO0AMQhLZBez3wn5KiumIuw44JbROMzoo",
  authDomain: "ceges-cf8ad.firebaseapp.com",
  projectId: "ceges-cf8ad",
  storageBucket: "ceges-cf8ad.firebasestorage.app",
  messagingSenderId: "673242495179",
  appId: "1:673242495179:web:177eae4112c792ade4c34e"
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

      /*
        const id = datos.id || "dispositivo_desconocido";
        const lat = datos.latitude;
        const lon = datos.longitude;
        const speed = datos.speed || 0;
        const bearing = datos.bearing || 0;
        */

      // Detectar si los datos vienen del formato nuevo (objeto location) o del formato plano
      const esFormatoNuevo = req.body.location && req.body.location.coords;
      const datosBase = esFormatoNuevo ? req.body.location.coords : (Object.keys(req.body).length > 0 ? req.body : req.query);
      
      // Extraer el ID del dispositivo (puede venir en device_id o id)
      let id = req.body.device_id || datosBase._id || "dispositivo_desconocido";
      
      const topic = datos.topic || datosBase.topic;
      if (topic) {
            const partes = topic.split('/'); 
            if (partes.length > 0) {
                // Usamos 'partes.length - 1' para asegurar que siempre tome la última palabra (ej: motorola)
                id = partes[partes.length - 2]; 
            }
        }
      
      // Extraer las coordenadas y datos según el formato que llegue
      const lat = datosBase.latitude || datosBase.lat;
      const lon = datosBase.longitude || datosBase.lon;
      
      // Extraer el rumbo (heading en formato nuevo, bearing en formato viejo)
      // Si es -1 (inválido), lo guardamos como 0
      const headingVal = datosBase.heading !== undefined ? datosBase.heading : (datosBase.bearing || 0);
      const bearing = headingVal === -1 ? 0 : headingVal;
      
      const speed = datosBase.speed && datosBase.speed > 0 ? datosBase.speed : 0;
  

        if (!lat || !lon) {
            console.log("📡 Petición recibida, pero faltan coordenadas válidas.");
            return res.status(200).send({ success: false, message: "Faltan coordenadas" }); 
        }

        console.log(`📡 Datos procesados -> ID: ${id} | Lat: ${lat} | Lng: ${lon}`);

        // Guardar en Firestore
        await setDoc(doc(db, "dispositivos_gps", String(id)), {
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
