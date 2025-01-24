export interface User extends CreateUserDTO {
  id: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  userType: string;
}

export enum UserType {
  student = 'student',
  teacher = 'teacher',
  parent = 'parent',
  privateTeacher = 'private teacher',
}
