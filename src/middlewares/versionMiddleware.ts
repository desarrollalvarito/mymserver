import { Request, Response, NextFunction } from 'express';

export const versionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Agregar información de versión a la respuesta
  res.setHeader('X-API-Version', 'v1');
  res.setHeader('X-API-Version-Date', '2024-01-01');
  
  next();
};

export const checkAPIVersion = (version: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestedVersion = req.headers['accept-version'] || req.query.version;
    
    if (requestedVersion && requestedVersion !== version) {
      res.status(400).json({
        success: false,
        error: `Unsupported API version. Please use version ${version}`,
        supportedVersion: version
      });
      return;
    }
    
    next();
  };
};