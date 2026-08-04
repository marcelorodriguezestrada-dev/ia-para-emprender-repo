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

const COLECCION = "materiales";

export type TipoMaterial = "diapositivas" | "video" | "acceso" | "otro";

export interface NuevoMaterial {
  clase: string; // ej: "Clase 1", "Clase gratuita", "General"
  titulo: string; // ej: "Diapositivas - Estrategia con IA"
  tipo: TipoMaterial;
  url: string;
  notas?: string;
}

export interface Material extends NuevoMaterial {
  id: string;
  created_at: string;
}

export async function guardarMaterial(datos: NuevoMaterial): Promise<void> {
  const datosLimpios = Object.fromEntries(
    Object.entries(datos).filter(([, valor]) => valor !== undefined && valor !== "")
  );
  await addDoc(collection(db, COLECCION), {
    ...datosLimpios,
    created_at: serverTimestamp(),
  });
}

export async function listarMateriales(): Promise<Material[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      clase: data.clase,
      titulo: data.titulo,
      tipo: data.tipo,
      url: data.url,
      notas: data.notas,
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies Material;
  });
}

export async function borrarMaterial(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECCION, id));
}
