declare namespace Express {
  export interface Request {
    uploadType?: string;
    user?: {
      id?: number;
      role: string | number;
      [key: string]: any;
    };
  }
}