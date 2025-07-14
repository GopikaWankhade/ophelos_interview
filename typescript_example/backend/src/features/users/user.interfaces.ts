export interface RequiredUserData {
  email: string;
  name: string;
  password: string;
}

export interface PublicUserData extends Omit<RequiredUserData, "password"> {
  id: number;
  createdAt: Date;
}

export interface PrivateUserData extends RequiredUserData {
  id: number;
  createdAt: Date;
}
