"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidator = void 0;
const common_1 = require("@nestjs/common");
class PasswordValidator {
    static validate(password) {
        const errors = [];
        if (password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }
        if (!/\d/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors);
        }
    }
}
exports.PasswordValidator = PasswordValidator;
//# sourceMappingURL=password.validator.js.map