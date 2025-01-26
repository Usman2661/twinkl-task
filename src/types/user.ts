export interface User extends Omit<CreateUserDTO, 'password'> {
  id: number;
  createdAt: Date | string;
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  createdAt?: Date | string;
}

export enum UserType {
  student = 'student',
  teacher = 'teacher',
  parent = 'parent',
  privateTutor = 'private tutor',
}
