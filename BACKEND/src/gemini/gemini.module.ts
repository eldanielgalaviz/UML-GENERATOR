import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ExportarController } from '../exportar.controller'; // Corrige el nombre aquí
import { CodeStorageService } from '../code-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [GeminiController, ExportarController],
  providers: [GeminiService, CodeStorageService],
})
export class GeminiModule {}