export interface LoginUserInputDto {
  email: string;
  password: string;
}

export interface LoginUserOutputDto {
  token: string;
}
