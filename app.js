const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


//Importa rotas
const teamsRoutes = require('./api/routes/teams');
const membersRoutes = require('./api/routes/members');
const hackatonsRoutes = require('./api/routes/hackatons');
const userRoutes = require('./api/routes/user');

//Faz conexão com o Atlas
mongoose.connect('mongodb+srv://sigeton:' + process.env.MONGO_ATLAS_PW + '@sigeton-wrsic.mongodb.net/test?retryWrites=true', err => {
    return {
        message: 'Falha de conexão com a rede',
        code: 500,
        status: false
    };
});

//Morgan pra pegar o timing e o type de cada request
app.use(morgan('dev'));

//Libera o acesso a pasta de uploads
app.use('/uploads', express.static('uploads'))

//Bodyparser para pegar dados do POST (atualmente é  usado express, mas preferi colocar ao modo "antigo")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Headers para previnir CORS (chamadas de portas diferentes)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({
        });
    }

    next();
});

//Configurando uso das rotas conforme elas foram importadas
app.use('/members', membersRoutes);
app.use('/hackatons', hackatonsRoutes);
app.use('/teams', teamsRoutes);
app.use('/user', userRoutes);


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;