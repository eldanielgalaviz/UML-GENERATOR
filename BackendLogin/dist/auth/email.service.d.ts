import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    private verifyConnection;
    sendConfirmationEmail(to: string, token: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
