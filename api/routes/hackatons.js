const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')

const Hackaton = require('../models/hackatons');

router.get('/', (req, res, next) => {
    Hackaton.find()
        .select('-__v')
        .then(snapshot => {
            const response = {
                count: snapshot.length,
                hackatons: snapshot.map(hackaton => {
                    return {
                        __id: hackaton.__id,
                        name: hackaton.name,
                        local: hackaton.local,
                        description: hackaton.description,
                        teams: hackaton.hackatons,
                        teamsQuantity: hackaton.teamsQuantity
                    }
                })
            };

            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}); //READY

router.post('/', checkAuth, (req, res, next) => {
    const hackaton = new Hackaton({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        local: req.body.local,
        description: req.body.description,
        teams: req.body.teams,
        teamsQuantity: req.body.teamsQuantity
    });

    hackaton.save()
        .then(result => {
            res.status(201).json({
                message: "New hackaton created",
                hackaton: result,
                status: true
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                status: false
            });
    });
}); //READY

router.get('/:hackatonId', (req,res,next) => {
    const id = req.params.hackatonId;

    Hackaton.findById(id)
        .then(snapshot => {
            if(snapshot){
                res.status(200).json(snapshot);
            }else{
                res.status(404).json({
                    message: "Invalid hackaton id"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        }
    );
}); //READY

router.patch('/:hackatonId', checkAuth, (req,res,next) => {
    const id = req.params.hackatonId;
    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Hackaton.update({_id: id}, { $set: updateOps })
        .then(result => {
            res.status(200).json({
                message: "Hackaton updated",
                hackaton: result,
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

router.delete('/:hackatonId', checkAuth, (req,res,next) => {
    const id = req.params.hackatonId;

    Hackaton.findByIdAndRemove({ _id: id })
        .then(result => {
            if(result){
                res.status(200).json({
                    message: "Hackaton deleted",
                    status: true
                });
            }else{
                res.status(500).json({
                    message: "Invalid hackaton id",
                    status: false
                })
            }
        })
        .catch(err => {
            res.status(200).json({
                error: err,
                status: fasle
            });
        });
}); //READY

module.exports = router;
