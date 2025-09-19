export interface IUser {
  id: number;
  username: string;
  email: string | null;
  password: string;
  personId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSession {
  id: number;
  username: string;
  email: string | null;
  person: {
    id: number;
    run: string | null;
    names: string;
    lastName: string | null;
    employee?: {
      jobRole: string;
      workShift: string;
    } | null;
  };
}

export interface ILoginCredentials {
  username: string;
  password: string;
}

export interface IUserCreate {
  username: string;
  email?: string;
  password: string;
  personId: number;
}

export interface IUserUpdate {
  id: number;
  username?: string;
  email?: string;
  password?: string;
  personId?: number;
}