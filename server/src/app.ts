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
// const corsOptions = {
//   origin: 'http://localhost:3000', // Specify your frontend's origin
//   credentials: true, // Allow cookies and credentials
// };
const corsOptions = {
  origin: true,
  // origin: 'http://localhost:3000/',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

//
// parser and middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// api initialization
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
