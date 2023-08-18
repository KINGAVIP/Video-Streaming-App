import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt';
import { secret } from './utils/constants';
import { join } from 'path/posix';
import {ServeStaticModule} from '@nestjs/serve-static'
import { User, UserSchema } from './model/user.schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/Stream'),
    MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
    JwtModule.register({
      secret,
      signOptions:{expiresIn:'6h'},
    }),
    // The ServeStaticModule decorator enables us to render the files to the client.
    ServeStaticModule.forRoot({
      rootPath:join(__dirname,'..','public'),
    }),
  ],
  controllers: [AppController,UserController],
  providers: [AppService,UserService],
})
export class AppModule {}
