export interface GetChannelInfoInputDto {
  userId: string;
}

export interface GetChannelInfoOutputDto {
  userId: string;
  username: string;
  streamKey: string;
  streamTitle: string;
  streamDescription: string;
  isLive: boolean;
}
