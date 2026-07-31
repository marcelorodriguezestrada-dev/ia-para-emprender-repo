import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const COLECCION = "campanas_generadas";

export interface PostGenerado {
  formato: string; // Feed | Story | Reel | Carrusel
  texto: string;
  hashtags: string;
  cta: string;
  hora_optima: string;
  tip_visual: string;
}

export interface DiaCalendario {
  dia: number;
  post_idx: number;
  nota: string;
}

export interface LinkUtmCampana {
  label: string;
  url: string; // el link corto /go/[id], ya con seguimiento de clics
  campanaUtmId: string; // el id del doc en campanas_utm, para poder ver los clics
}

export interface CampanaGenerada {
  id: string;
  titulo_campana: string;
  concepto: string;
  publico_objetivo: string;
  red: string;
  objetivo: string;
  tono: string;
  posts: PostGenerado[];
  calendario: DiaCalendario[];
  utm_links: LinkUtmCampana[];
  kpis: string[];
  presupuesto_sugerido: string;
  autorEmail: string;
  created_at: string;
}

export type NuevaCampanaGenerada = Omit<CampanaGenerada, "id" | "created_at">;

export async function guardarCampanaGenerada(datos: NuevaCampanaGenerada): Promise<CampanaGenerada> {
  const ref = await addDoc(collection(db, COLECCION), {
    ...datos,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, ...datos, created_at: new Date().toISOString() };
}

export async function listarCampanasGeneradas(): Promise<CampanaGenerada[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      ...(data as NuevaCampanaGenerada),
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies CampanaGenerada;
  });
}

export async function borrarCampanaGenerada(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECCION, id));
}
