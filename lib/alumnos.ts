import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const COLECCION = "alumnos";

export type EstadoAlumno = "pendiente_pago" | "pagado";

export interface NuevoAlumno {
  nombre: string;
  email: string;
  whatsapp?: string;
  idea: string; // lo que cuenta de su negocio al inscribirse
}

export interface Alumno extends NuevoAlumno {
  id: string;
  estado: EstadoAlumno;
  notas: string; // notas privadas tuyas, para acompañarlo clase a clase
  created_at: string;
}

export async function guardarAlumno(datos: NuevoAlumno): Promise<void> {
  const datosLimpios = Object.fromEntries(
    Object.entries(datos).filter(([, valor]) => valor !== undefined && valor !== "")
  );
  await addDoc(collection(db, COLECCION), {
    ...datosLimpios,
    estado: "pendiente_pago" satisfies EstadoAlumno,
    notas: "",
    created_at: serverTimestamp(),
  });
}

export async function listarAlumnos(): Promise<Alumno[]> {
  const q = query(collection(db, COLECCION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const createdAt = data.created_at as Timestamp | null;
    return {
      id: d.id,
      nombre: data.nombre,
      email: data.email,
      whatsapp: data.whatsapp,
      idea: data.idea ?? "",
      estado: (data.estado ?? "pendiente_pago") as EstadoAlumno,
      notas: data.notas ?? "",
      created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    } satisfies Alumno;
  });
}

export async function actualizarEstadoAlumno(id: string, estado: EstadoAlumno): Promise<void> {
  await updateDoc(doc(db, COLECCION, id), { estado });
}

export async function actualizarNotasAlumno(id: string, notas: string): Promise<void> {
  await updateDoc(doc(db, COLECCION, id), { notas });
}
