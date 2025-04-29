import { BadRequestException } from '@nestjs/common';

export class PasswordValidator {
  static validate(password: string): void {
    const errors: string[] = [];

    // Verificar longitud mínima
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si contiene al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Verificar si contiene al menos un número
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}