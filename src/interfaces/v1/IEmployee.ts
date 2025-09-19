import { JobRoles, State, Person } from '@prisma/client';

export interface IEmployee {
  id: number;
  jobRole: JobRoles;
  workShift: string;
  state: State;
  personId: number;
  person?: Person;
}

export interface IEmployeeCreate {
  jobRole: JobRoles;
  workShift: string;
  personId: number;
}

export interface IEmployeeUpdate {
  id: number;
  jobRole?: JobRoles;
  workShift?: string;
  personId?: number;
  state?: State;
}

export interface IEmployeeService {
  listEmployees(): Promise<IEmployee[]>;
  addEmployee(data: IEmployeeCreate): Promise<IEmployee>;
  modifyEmployee(data: IEmployeeUpdate): Promise<IEmployee>;
  removeEmployee(id: number): Promise<IEmployee>;
}