import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
// setting up multer for  uploading and streaming
import { diskStorage } from 'multer';
// uuid for generating random names to file we are uploading
import { v4 as uuidv4 } from 'uuid';
import { MulterModule } from '@nestjs/platform-express';
import { Video, VideoSchema } from './model/video.schema';

import { VideoController } from './controllers/video.controller';
import { VideoService } from './service/video.service';
import { isAuthenticated } from './app.middleware';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/Stream'),
    MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
    MongooseModule.forFeature([{name:Video.name,schema:VideoSchema}]),
    MulterModule.register({
      storage:diskStorage({
        destination:'./public',
        // cb used in filename is callback here
        filename:(req,file,cb)=>{
          const ext=file.mimetype.split('/')[1];
          cb(null,`${uuidv4()}-${Date.now()}.${ext}}`)
        }
      })
    }),
    JwtModule.register({
      secret,
      signOptions:{expiresIn:'6h'},
    }),
    // The ServeStaticModule decorator enables us to render the files to the client.
    ServeStaticModule.forRoot({
      rootPath:join(__dirname,'..','public'),
    }),
  ],
  controllers: [AppController,UserController,VideoController],
  providers: [AppService,UserService  ,VideoService],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer)
  {
    consumer.apply(isAuthenticated).exclude({
      path:'api/video/:id',method:RequestMethod.GET
    }).forRoutes(VideoController)
  }
}
