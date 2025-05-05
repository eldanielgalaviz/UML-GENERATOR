export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
    createdAt: Date;
    updatedAt: Date;
    isEmailConfirmed: boolean;
    confirmationToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;
}
