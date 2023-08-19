import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Video, VideoDocument } from "src/model/video.schema";
import { Model } from "mongoose";
import { Response,Request, response } from "express";
import { statSync,createReadStream } from "fs";
import {join} from 'path/posix'
@Injectable()
export class VideoService{
    constructor(@InjectModel(Video.name) private videoModel:Model<VideoDocument>){}
    // createVideo function to save the model into database collection
    async createVideo(video:Object):Promise<Video>{
        const newVideo=new this.videoModel(video)
        return newVideo.save()
    }

    // readVideo function to get details of video
    async readVideo(id):Promise<any>{
        if(id.id)
        {
            return this.videoModel.findOne({_id:id.id}).populate("CreatedBy").exec()
        }
        return this.videoModel.find().populate("CreatedBy").exec()
    }

    // streamVideo function to send video as a stream to the client. video will be breaked into 1mb chunks and sent to client
    async streamVideo(id:string,res:Response,req:Request)
    {
        try{
            const data=await this.videoModel.findOne({_id:id})
            if(!data)
            {
                throw new NotFoundException(null,"VideoNotFound")
            }
            const {range}=req.headers
            if(range)
            {
                const {video}=data
                const videoPath=statSync(join(process.cwd(),`./public/${video}`))
                const CHUNK_SIZE=1*1e6;
                const start=Number(range.replace(/\D/g,''));
                const end =Math.min(start+CHUNK_SIZE,videoPath.size-1);
                const videoLength=end-start+1
                res.status(206)
                res.header({
                    'Content-Range':`bytes ${start}-${end}/${videoPath.size}`,
                    'Accepted-Ranges':'bytes',
                    'Content-length':videoLength,   
                    'Content-Type':'video.mp4',
                })
                const videoStream=createReadStream(join(process.cwd(),`./public/${video}`),{start,end})
                videoStream.pipe(response);
            }
            else{
                throw new NotFoundException(null,'range not found')
            }
        }
        catch(e)
        {
            console.log(e)
            throw new ServiceUnavailableException()
        }
    }
    async update(id,video:Video):Promise<Video>
    {
        return await this.videoModel.findByIdAndUpdate(id,video,{new:true})
    }
    async delete(id):Promise<any>
    {
        return await this.videoModel.findByIdAndDelete(id);
    }
}