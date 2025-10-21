// const express= require('express');
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.routes.js';
import { connectDB } from './lib/db.js';
import {ENV} from './lib/env.js';
import cors from 'cors';
import {app, server} from './lib/socket.js';


const __dirname=path.resolve();
const PORT=ENV.PORT || 3000;

app.use(express.json({limit:"5mb"})); //middleware to parse json data req.body
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})); //enable CORS for frontend domain
app.use(cookieParser()); //middleware to parse cookies


app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);


//make ready for deployment 
if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*",(_,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    })
}



server.listen(PORT,()=>{
    console.log("Server running on port: " + PORT)
    connectDB();
    });