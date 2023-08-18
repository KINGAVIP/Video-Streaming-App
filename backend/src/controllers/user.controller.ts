// User controller will involves user authorization
import {Body, Controller, HttpStatus, Post, Res} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import { UserService } from 'src/service/user.service'
import { User } from 'src/model/user.schema'
@Controller('/api/user')
export class UserController{
    constructor(private readonly userService:UserService, private jwtService:JwtService){}
    @Post('/signup')
    async Signup(@Res() response,@Body() user:User)
    {
        const newUser=await this.userService.signup(user)
        return response.status(HttpStatus.CREATED).json({
            newUser
        })
    }
    @Post('/signin')
    async Signin(@Res() response,@Body() user:User)
    {
        const token=await this.userService.signin(user,this.jwtService)
        return response.status(HttpStatus.OK).json({
            token
        })
    }
}