import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5006',
      'http://localhost:5007',
      'https://dayditto.co.kr',
      'https://www.dayditto.co.kr',
      'https://admin.dayditto.co.kr',
    ],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 4000);
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
void bootstrap();
