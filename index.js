const express = require('express');
const db = require('./db');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');


const server = express();

server.use(express.json());

server.post('/login', (req,res) => {
    const {username, password} = req.body;
    db.select('id','username').from('users').where('username',username)
    .then(([user]) => {
        console.log(user);
        user.token = getToken(user);
        res.status(200).json(user);
    })
    .catch();
})

server.post('/register', (req,res) => {
    db('users').insert(req.body)
    .then( ([id]) => {
        db.select('id','username').from('users').where('id',id)
        .then(([user]) => {
            if (user) {
                user.token = getToken(user);
                res.status(200).json(user);
            } else {
                res.status(404).end();
            }
        })
    })
    .catch(err => res.status(500).json(err.message));
})

server.post('/logout', (req,res) => {
    if (req.headers && req.headers.authentication) {
        db('blacklist').insert({token : req.headers.authentication})
        .then(resp => {
            console.log(resp); 
            res.status(200).json({mes: 'logged out'}) })
        .catch(err => res.status(500).json(err.message));
    } else {
        res.status(403).json('you cannot logout');
    }
    
})

server.get('/', (req,res) => {
    res.send('you are at the server');
})

server.get('/users', authenticate, (req,res) => {
    db.select('*').from('users')
    .then(users => {
        res.status(200).json({loggedInUser : req.user, users})
    })
    .catch(err => res.status(500).json(err.message))
});

function getToken(user) {

    const payload = {
        username : user.username
    }

    const options = {
        expiresIn: '1h'
    }

    return jwt.sign(payload, 'this will be OUR little secret',options);
}

function authenticate(req,res,next) {
    const token = req.headers.authentication;
    jwt.verify(token,'this will be OUR little secret',(err,decoded) => {
        if (err) {
            res.status(401).json({message : 'sorry, not allowed to enter'})
        } else {
            req.user = decoded.username;
            db.select('*').from('blacklist').where('token',token).first()
            .then(resp => {
                console.log(resp);
                if (!resp) {
                    res.status(401).json({mes : 'trying to access a resource while logged out.  unauthorized'});
                } else {
                    next();
                }
            })
            .catch(err => res.status(403).json(err.message))
        }
    })
}

server.listen(5000, ()=> console.log('server listening on port 5000'));