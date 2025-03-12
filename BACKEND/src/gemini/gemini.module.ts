import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ExportController } from '../export.controller';
import { CodeStorageService } from '../code-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [GeminiController, ExportController],
  providers: [GeminiService, CodeStorageService],
})
export class GeminiModule {}