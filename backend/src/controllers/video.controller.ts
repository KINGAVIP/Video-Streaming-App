import {Controller,Post,Get,Put,Delete,UseInterceptors,HttpStatus,Param,Body,Res,Req,UploadedFiles,Query} from '@nestjs/common' 
import { VideoService } from 'src/service/video.service'
import { Video } from 'src/model/video.schema'
import {FileFieldsInterceptor,FileInterceptor} from '@nestjs/platform-express'
@Controller('api/video')
export class VideoController{
    constructor(private readonly videoService:VideoService){}

    @Post()
    // UseInterceptors is used to bind FileFieldInterceptor which is used to extract files from request with uploaded files 
    // maxcount specifies only one file per field
    @UseInterceptors(FileFieldsInterceptor([
        {name:'video',maxCount:1},
        {name:'cover',maxCount:1},
    ]))
    async createBook(@Res() response,@Req() request,@Body() video:Video,@UploadedFiles() files:{video?:Express.Multer.File[],cover?:Express.Multer.File[]})
    {
        const requestBody={createdBy:request.user,title:video.title,video:files.video[0].filename,coverImage:files.cover[0].filename}
        const newVideo=await this.videoService.createVideo(requestBody);
        return response.status(HttpStatus.CREATED).json({
            newVideo
        })
    }
    @Get()
    async read (@Query() id):Promise<Object>{
        return await this.videoService.readVideo(id);
    }

    @Get()
    async stream(@Param('id') id,@Res() response,@Req() request)
    {
        return this.videoService.streamVideo(id,response,request)
    }

    @Put('/:id')
    async update(@Res() response,@Param('id') id,@Body() video:Video)
    {
        const  updatedVideo=await this.videoService.update(id,video);
        return response.status(HttpStatus.OK).json(updatedVideo)
    }

    @Delete('/:id')
    async delete(@Res() response,@Param('id') id){
        await this.videoService.delete(id)
        return response.status(HttpStatus.OK).json({
            user:null
        })
    }
}
