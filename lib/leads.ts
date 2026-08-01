import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

const COLECCION = "leads";

export interface NuevoLead {
  nombre: string;
  email: string;
  // de dónde vino (si llegó con parámetros utm_* en la URL de /registro, los guardamos)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface Lead extends NuevoLead {
  id: string;
  created_at: string;
}

export async function guardarLead(datos: NuevoLead): Promise<void> {
  // Firestore rechaza el documento entero si algún campo es `undefined`
  // (pasa cuando alguien entra a /registro sin parámetros utm_*). Filtramos
  // esos campos antes de guardar, en vez de mandarlos como undefined.
  const datosLimpios = Object.fromEntries(
    Object.entries(datos).filter(([, valor]) => valor !== undefined)
  );

  await addDoc(collection(db, COLECCION), {
    ...datosLimpios,
    created_at: serverTimestamp(),
  });
}

export async function listarLeads(): Promise<Lead[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      nombre: data.nombre,
      email: data.email,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies Lead;
  });
}