import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDTO {
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: 'strongPassword123!',
  })
  password: string;
}
