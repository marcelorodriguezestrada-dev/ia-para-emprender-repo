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

const COLECCION = "posts_generados";

export interface NuevoPost {
  tema: string; // sobre qué se pidió el post (ej: "Clase 3 - productos digitales")
  tono: string; // ej: "entusiasta", "urgencia", "educativo"
  contenido: string; // el texto generado, lo que se copia a Facebook
  autorEmail: string;
}

export interface PostGenerado extends NuevoPost {
  id: string;
  created_at: string;
}

export async function guardarPost(datos: NuevoPost): Promise<PostGenerado> {
  const ref = await addDoc(collection(db, COLECCION), {
    ...datos,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, ...datos, created_at: new Date().toISOString() };
}

export async function listarPosts(): Promise<PostGenerado[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      tema: data.tema,
      tono: data.tono,
      contenido: data.contenido,
      autorEmail: data.autorEmail,
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies PostGenerado;
  });
}

export async function borrarPost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECCION, id));
}
