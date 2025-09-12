export interface CreateUserInputDto {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserOutputDto {
  id: string;
  username: string;
  email: string;
}
