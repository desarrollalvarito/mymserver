import { Gender } from '@prisma/client';

export interface IPerson {
  id: number;
  run?: string | null;
  names: string;
  lastName?: string | null;
  gender: Gender;
  address?: string | null;
  contact?: string | null;
  birthdate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPersonCreate {
  run?: string | null;
  names: string;
  lastName?: string | null;
  gender: Gender;
  address?: string | null;
  contact?: string | null;
  birthdate?: Date | string | null;
}

export interface IPersonUpdate {
  id: number;
  run?: string | null;
  names?: string;
  lastName?: string | null;
  gender?: Gender;
  address?: string | null;
  contact?: string | null;
  birthdate?: Date | string | null;
}

export interface IPersonService {
  listPersons(): Promise<IPerson[]>;
  addPerson(data: IPersonCreate): Promise<IPerson>;
  modifyPerson(data: IPersonUpdate): Promise<IPerson>;
  removePerson(id: number): Promise<IPerson>;
}