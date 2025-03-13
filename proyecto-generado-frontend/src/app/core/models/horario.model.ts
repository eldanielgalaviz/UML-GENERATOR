export interface Horario {
  id: number;
  grupo: string;
  clase: string;
  horaInicio: string; // Store as string in 'HH:mm' format
  horaFin: string;   // Store as string in 'HH:mm' format
}