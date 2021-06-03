import { ErrorRequestHandler, Request, Response } from 'express';

export interface ErrorObject {
  name?: string;
  message?: string;
  stack?: string;
  /** @default 1 */
  code?: number;
  /** @default 500 */
  status?: number;
  /**
   * should print the error in console log
   * @default true
   */
  printToConsole?: boolean;
  /**
   * should print full stack message in console log
   * @default true
   */
  showStack?: boolean;
}

export type ErrorInfo = ErrorObject | string;

export type JsonErrorHandlerLogger = (data: { err: ErrorInfo; req: Request; res: Response }) => void;

export interface JsonErrorHandlerOpts {
  /** @default dev */
  stack?: 'dev' | 'always' | 'none';
  /** @default true */
  log?: boolean | JsonErrorHandlerLogger;
}

interface ErrorResponseData {
  code: number;
  error: string;
  stack?: string;
}

export default function jsonErrorHandler(opts?: JsonErrorHandlerOpts): ErrorRequestHandler {
  const _opts: JsonErrorHandlerOpts = { stack: 'dev', log: true, ...opts };
  return (err, req, res, next) => {
    const status = err.status || 500;
    const code = err.code || 1;
    const message = err.message || err;
    if (typeof _opts.log === 'function') {
      _opts.log({ err, req, res });
    } else if (_opts.log === true) {
      log({ err, req, res });
    }
    const result: ErrorResponseData = { code, error: message };
    if (showStack(_opts)) {
      result.stack = err.stack;
    }
    res.status(status).json(result);
  };
}

const log: JsonErrorHandlerLogger = ({ err, req, res }) => {
  if (typeof err !== 'object') {
    console.error(`${err}`);
  } else if (err.printToConsole !== false) {
    console.error(err.showStack === false ? `${err.name}: ${err.message}` : err.stack);
  }
};

function showStack(opts: JsonErrorHandlerOpts) {
  return opts.stack === 'always' || (opts.stack === 'dev' && process.env.NODE_ENV !== 'production');
}
