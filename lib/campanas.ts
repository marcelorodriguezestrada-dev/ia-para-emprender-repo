import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const COLECCION = "campanas_utm";

export interface NuevaCampana {
  nombre: string; // nombre interno para reconocerla en la lista, ej: "Difusión 3 días - FB"
  urlDestino: string; // a dónde tiene que llegar la persona (ej: la landing o registro.html)
  utmSource: string; // ej: facebook, whatsapp, instagram
  utmMedium: string; // ej: social, cpc, referral, organic
  utmCampaign: string; // ej: lanzamiento-diciembre
  utmContent?: string; // opcional: para diferenciar variantes del mismo post/anuncio
}

export interface Campana extends NuevaCampana {
  id: string;
  clics: number;
  created_at: string;
}

/**
 * Arma la URL completa con los parámetros UTM ya incluidos.
 * `urlDestino` puede ser relativa (ej: "/registro") ahora que todo vive en
 * el mismo dominio — por eso pedimos `base` para poder resolverla.
 */
export function construirUrlConUtm(datos: NuevaCampana, base?: string): string {
  const url = new URL(datos.urlDestino, base);
  url.searchParams.set("utm_source", datos.utmSource);
  url.searchParams.set("utm_medium", datos.utmMedium);
  url.searchParams.set("utm_campaign", datos.utmCampaign);
  if (datos.utmContent) url.searchParams.set("utm_content", datos.utmContent);
  return url.toString();
}

export async function crearCampana(datos: NuevaCampana): Promise<Campana> {
  // Mismo problema que en leads: Firestore rechaza el documento si
  // "utmContent" viene undefined (pasa en los links de "bio", que no lo usan).
  const datosLimpios = Object.fromEntries(
    Object.entries(datos).filter(([, valor]) => valor !== undefined)
  );

  const ref = await addDoc(collection(db, COLECCION), {
    ...datosLimpios,
    clics: 0,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, ...datos, clics: 0, created_at: new Date().toISOString() };
}

export async function listarCampanas(): Promise<Campana[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      nombre: data.nombre,
      urlDestino: data.urlDestino,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      clics: data.clics ?? 0,
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies Campana;
  });
}

export async function borrarCampana(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECCION, id));
}

/** Usado por el endpoint de redirect (/go/[id]) — corre en el servidor, sin auth de usuario. */
export async function registrarClicYObtenerDestino(id: string, origin: string): Promise<string | null> {
  const ref = doc(db, COLECCION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  await updateDoc(ref, { clics: increment(1) });

  const datos = snap.data() as NuevaCampana;
  return construirUrlConUtm(datos, origin);
}