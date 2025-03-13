import { Injectable, Logger } from '@nestjs/common';
import { GeneratedCode } from './gemini/interfaces/code-generation.interface';

@Injectable()
export class CodeStorageService {
  private readonly logger = new Logger(CodeStorageService.name);
  private ultimoCodigo: GeneratedCode | null = null;

  /**
   * Almacena el código generado para acceso posterior
   */
  guardarCodigoGenerado(codigo: GeneratedCode): void {
    this.logger.log('Almacenando nuevo código generado');
    this.ultimoCodigo = codigo;
  }

  /**
   * Obtiene el último código generado
   */
  obtenerUltimoCodigoGenerado(): GeneratedCode | null {
    return this.ultimoCodigo;
  }

  /**
   * Verifica si hay código disponible
   */
  hayCodigoGenerado(): boolean {
    return this.ultimoCodigo !== null;
  }
}