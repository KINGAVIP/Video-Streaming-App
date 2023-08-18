import {Injectable,HttpException,HttpStatus} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import {Model } from 'mongoose'
import { UserDocument } from 'src/model/user.schema';
import { User } from 'src/model/user.schema';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
@Injectable()

export class UserService{
    constructor(@InjectModel(User.name) private userModel:Model<UserDocument>,){}
    async signup(user:User):Promise<User>{
        const salt=await bcrypt.genSalt()
        const hash = await bcrypt.hash(user.password,salt)
        const reqbody={
            fullname:user.fullname,
            email:user.email,
            password:hash
        }
        const newUser=new this.userModel(reqbody)
        return newUser.save();
    }
    async signin(user:User,jwt:JwtService):Promise<any>{
        const founduser=await this.userModel.findOne({email:user.email}).exec()
        if(founduser)
        {
            const {password}=founduser
            if(bcrypt.compare(user.password,password))
            {
                const payload={email:user.email}
                return{
                    token:jwt.sign(payload),
                }
            }
            return new HttpException('Incorrect passord or username',HttpStatus.UNAUTHORIZED)
        }
        return new HttpException('Incorrect passord or username',HttpStatus.UNAUTHORIZED)
    }
    // to retrieve data of a user based on emial
    async getOne(email:string):Promise<User>
    {
        return await this.userModel.findOne({email}).exec()
    }
}