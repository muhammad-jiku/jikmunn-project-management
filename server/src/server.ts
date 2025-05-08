import { v2 as cloudinary } from 'cloudinary';
import { Server } from 'http';
import app from './app';
import config from './config';
// import { logger, errorlogger } from './shared/logger';

process.on('uncaughtException', (error) => {
  // errorlogger.error(error); // debugging log
  console.error(error); // debugging log
  process.exit(1);
});

async function bootstrap() {
  // Cloudinary Config
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });

  const server: Server = app.listen(config.port, () => {
    // logger.info(`Server running on http://localhost:${config.port}`); // debugging log
    console.log(`Server running on http://localhost:${config.port}`); // debugging log
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        // logger.info('Server closed'); // debugging log
        console.log('Server closed'); // debugging log
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    // errorlogger.error(error); // debugging log
    console.error(error); // debugging log
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    // logger.info('SIGTERM received'); // debugging log
    console.log('SIGTERM received'); // debugging log
    if (server) {
      server.close();
    }
  });
}

bootstrap();
