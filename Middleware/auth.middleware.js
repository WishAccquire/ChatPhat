import jwt from 'jsonwebtoken'
import redisClient from '../services/redis.service.js'

export const authUser=async(req,res,next)=>{
    try{
        const token = req.cookies.token || (req.header('Authorization') ? req.header('Authorization').replace(/^bearer\s+/i, '') : '');
        console.log("token",token)
      
        if(!token){
            return res.status(401).send({error:"Unautorized User"})
        }
        const isBlackListed=await redisClient.get(token)
        
        if(isBlackListed){
            console.log(isBlackListed)
            res.cookie('token','')
            return res.status(401).send({error:"Unautorized User"})
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        console.log(err)
     res.status(401).send({error:'Please authenticate'});
    }
}