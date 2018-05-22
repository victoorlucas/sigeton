const checkAuth = require('../middleware/check-auth')
const bcrypt = require('bcrypt')
const multer = require('multer')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true)
    else cb(null, false)
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3
    },
    fileFilter: fileFilter
})

const Member = require('../models/members')

router.get('/', (req, res, next) => {
    Member.find()
        .select('-__v')
        .then(snapshot => {
            const response = {
                count: snapshot.length,
                members: snapshot.map(member => {
                    return {
                        id: member.id,
                        name: member.name,
                        email: member.email,
                        photoURL: member.photo,
                        phone: member.phone,
                        shirtSize: member.shirtSize,
                        typeOfmember: member.typeOfmember
                    }
                })
            };

            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}); //READY

router.post('/signup', upload.single('profileImage'), (req, res, next) => {
    Member.find({ email: req.body.email })
        .then(member => {
            if (member.length >= 1) {
                return res.status(409).json({
                    message: 'Este e-mail já está em uso',
                    code: 100,
                    status: false
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    const member = new Member({
                        id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        name: req.body.name,
                        phone: req.body.phone,
                        shirtSize: req.body.shirtSize,
                        typeOfmember: req.body.typeOfmember
                    });

                    member.save()
                        .then(result => {
                            res.status(200).json({
                                message: 'Membro criado com sucesso!',
                                member: result,
                                status: true,
                                code: 42
                            })
                        }, err => {
                            console.log(err)
                            res.status(500).json({
                                error: err,
                                status: false
                            })
                        })
                });

            }
        });
}); //READY

router.get('/:memberId', (req, res, next) => {
    const id = req.params.memberId;

    Member.find({id: id})
        .then(snapshot => {
            console.log(snapshot);

            if (snapshot.length > 0) {
                res.status(200).json(snapshot[0]);
            } else {
                res.status(404).json({
                    message: "Invalid member id"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
}); //READY

router.patch('/:memberId', checkAuth, (req, res, next) => {
    const id = req.params.memberId;
    const updateOps = {};

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Member.update({ _id: id }, { $set: updateOps })
        .then(result => {
            res.status(200).json({
                message: "member updated",
                team: result,
                status: true
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                status: false
            });
        });
}); //READY

router.delete('/:memberId', (req, res, next) => {
    const id = req.params.memberId;
    Member.findByIdAndRemove({ _id: id })
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: "member deleted",
                    status: true
                });
            } else {
                res.status(500).json({
                    message: "Invalid member id",
                    status: false
                })
            }
        })
        .catch(err => {
            res.status(200).json({
                error: err
            });
        });
}); //READY

router.post('/login', (req, res, next) => {
    Member.find({ email: req.body.email })
        .then(member => {
            if (member.length < 1) {
                return res.status(401).json({
                    message: 'Usuário ou senha incorreto!',
                    code: 104,
                    status: false
                });
            }

            bcrypt.compare(req.body.password, member[0].password, (error, result) => {
                if (result) {
                    const token = jwt.sign({
                        id: member[0].id,
                        email: member[0].email
                    },
                        "MYNEWKEY",
                        { expiresIn: "2h" }
                    );

                    return res.status(200).json({
                        message: 'Logado com sucesso',
                        token: token,
                        code: 40,
                        status: 1
                    })
                }else{
                    return res.status(401).json({
                        message: 'Usuário ou senha incorreto!',
                        code: 104,
                        status: false
                    });
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err,
                status: false
            })
        });
}); //READY

module.exports = router;
