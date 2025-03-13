export interface Asistencia {
  id: number;
  fecha: string; // Store as string in 'YYYY-MM-DD' format
  presente: boolean;
  usuarioId: number; // Foreign key to Usuario
}