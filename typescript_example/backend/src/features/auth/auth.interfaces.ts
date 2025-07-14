import { PublicUserData } from "../users/user.interfaces";

export interface AuthResponse {
  user: PublicUserData;
  token: string;
}
