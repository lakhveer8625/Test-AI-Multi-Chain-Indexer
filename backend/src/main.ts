import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Enable CORS
    // app.enableCors({
    //     origin: "*",
    //     // credentials: true,
    // });
    app.enableCors({
        origin: '*',
        methods: '*',
        allowedHeaders: '*',
    });
    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Multi-Chain Event Indexer API')
        .setDescription('Enterprise-grade multi-chain blockchain event indexing platform')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('events')
        .addTag('blocks')
        .addTag('contracts')
        .addTag('chains')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    console.log(`🎯 GraphQL Playground at http://localhost:${port}/graphql`);
}

bootstrap();
