import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import morgan from 'morgan';
import { ensureDatabaseConnection } from './app/middlewares/dbConnectionMiddleware';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';

const app: Application = express();

// TRUST PROXY – must come before any rate-limit or CORS
// On Vercel you generally trust the first proxy hop:
app.set('trust proxy', 1);

// cors options
// This is a simple CORS configuration.
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL as string]
      : 'http://localhost:3000',
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// cookie parsers and security
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));

// body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// api route initialization
app.use('/api/v1', ensureDatabaseConnection, routes);

// global error handler
app.use(globalErrorHandler);

// handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });

  next();
});

export default app;
