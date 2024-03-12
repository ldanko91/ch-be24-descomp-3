//LIBRERIAS
import { config } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import passport from "passport";
import initializePassport from "./config/passportConfig.js";

//RUTAS
import dbProdsRouter from "./routes/dbProds.routes.js";
import dbCartsRouter from "./routes/dbCarts.routes.js";
import dbChatRouter from "./routes/dbChat.routes.js";
import loginRouter from "./routes/login.routes.js";

//UTILS
import __dirname from "./dirname.js";

//CONFIG SERVERS
config();
const app = express()
const PORT = process.env.EXPRESS_PORT
const URL = process.env.DB_URL

const httpServer = app.listen(PORT, () => console.log(`Servidor conectado al puerto: ${PORT}`))

//CONFIG MONGOOSE
const connection = mongoose.connect(URL)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//CONFIG PASSPORT
initializePassport()
app.use(passport.initialize())

//config HBS!
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'))

//config Chat Socket
import ChatsDBManager from "./dao/dbManagers/ChatDBManager.js";
const DBChatManager = new ChatsDBManager();
const socketServer = new Server(httpServer)

socketServer.on('connection', socket => {
    console.log("Nuevo cliente conectado");

    const emitOldMessages = () => {
        const messages = DBChatManager.getMessages();
        socket.emit('message-showOldMessages', messages);
    };

    // Emitir mensajes antiguos cuando un nuevo cliente se conecta
    emitOldMessages();

    socket.on('sendMessage', data => {
        console.log(data);
        console.log("Mensaje enviado");

        // Agregar el nuevo mensaje
        DBChatManager.addMessage(data);

        // Emitir mensajes antiguos después de agregar el nuevo mensaje
        emitOldMessages();
    });
});

//vistas HBS!
app.use('/api/products', dbProdsRouter)
app.use('/api/carts', dbCartsRouter)
app.use('/chat', dbChatRouter)
app.use('/api/sessions', loginRouter)