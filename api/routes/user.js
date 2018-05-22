const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'User email already in use',
                    status: false
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });

                        user.save()
                            .then(result => {
                                res.status(200).json({
                                    message: 'User created',
                                    user: result,
                                    status: true
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err,
                                    status: false
                                })
                            })
                    }
                });

            }
        });
}); //READY

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }

                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        __id: user[0].__id
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "2h"
                        }
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    })
                }

                return res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err,
                status: false
            })
        })
});

router.delete('/:userId', (req, res, next) => {
    User.remove({ __id: req.params.userId })
        .then(result => {
            res.status(200).json({
                message: 'User deleted',
                status: true
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                status: false
            });
        })
}); //READY

module.exports = router;