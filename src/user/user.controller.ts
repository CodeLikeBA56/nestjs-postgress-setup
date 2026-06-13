import { UserService } from './user.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserRole } from './user.types';
import { UpdateUserDTO } from './dto/update-user.dto';
import { RegisterUserDTO } from 'src/auth/dto/register.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async createUser(@Body() registerUserDTO: RegisterUserDTO) {
    const user = await this.userService.registerUser(registerUserDTO);
    return user;
  }

  @Get('/')
  @ApiOperation({
    summary: 'List all users',
    description:
      'Retrieves a filtered and paginated list of users based on the provided query parameters.',
  })
  @ApiQuery({
    name: 'role',
    enum: UserRole,
    required: false,
    description: 'Filter users by admin, manager, member role',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Page number (defaults to 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    description: 'Number of records per page (defaults to 10)',
  })
  @ApiOkResponse({ description: 'Users retrived successfully.' })
  @ApiBadRequestResponse({
    description: 'User role is not valid. Expecting admin, manager, or member.',
  })
  async listUsers(
    @Query('role') role?: UserRole,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const users = this.userService.findAll({ role, page, limit });

    return users;
  }

  @Get('/:id')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Find user by unique id',
    description: 'Retrives a user record based on the provided user id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: "Provide user id to fetch it's record",
  })
  @ApiOkResponse({ description: 'User retrived successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'The user id is missing.' })
  async findUseryId(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @Put('/:id')
  @ApiOperation({
    summary: "Update user by it's unique id",
    description: 'Updates a user record based on the provided user id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: "Provide user id to update it's record",
  })
  async updateUserById(@Param('id') id: string, @Body() updatedData: UpdateUserDTO) {
    return this.userService.updateUserById(id, updatedData);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: "Delete user by it's unique id",
    description: 'Deletes a user record based on the provided user id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: "Provide user id to delete it's record",
  })
  async deleteUserById(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
