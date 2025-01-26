export interface User extends Omit<CreateUserDTO, 'password'> {
  id: number;
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  createdAt: Date | string;
}

export enum UserType {
  student = 'student',
  teacher = 'teacher',
  parent = 'parent',
  privateTeacher = 'private teacher',
}
