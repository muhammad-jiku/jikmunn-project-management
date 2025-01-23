import { Server } from 'http';
import app from './app';

const port = 5001;

process.on('uncaughtException', (error) => {
  console.error(error);
  process.exit(1);
});

async function bootstrap() {
  const server: Server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log('Server closed');
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (server) {
      server.close();
    }
  });
}

bootstrap();
