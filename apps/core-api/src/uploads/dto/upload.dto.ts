import { IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import type { FileType } from '@plantaviva/types';

const ALLOWED_EXTENSIONS: FileType[] = ['pdf', 'jpg', 'png', 'dwg', 'dxf', 'ifc', 'rvt'];

export class RequestSasDto {
  @IsString()
  filename!: string;

  @IsIn(ALLOWED_EXTENSIONS)
  fileType!: FileType;

  @IsInt()
  @Min(1)
  @Max(209715200) // 200MB
  fileSize!: number;
}
