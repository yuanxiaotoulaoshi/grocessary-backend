export class CreateListenDto {
  readonly sentence: string;
  readonly videoId: string;
  readonly start: number;
  readonly end: number;
  readonly audioPath:string;
  readonly baseName:string;
}