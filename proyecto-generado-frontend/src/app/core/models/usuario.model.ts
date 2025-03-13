export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string; // e.g., 'alumno', 'profesor', 'jefeDeGrupo'
}