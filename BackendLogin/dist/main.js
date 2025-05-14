"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:4200'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Accept,Authorization,session-id',
        exposedHeaders: ['Content-Disposition'],
        credentials: true,
    });
    const port = process.env.PORT || 3005;
    await app.listen(port);
    console.log(`Servidor ejecutándose en: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map