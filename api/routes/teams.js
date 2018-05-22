const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')

const Team = require('../models/teams');

router.get('/', (req, res, next) => {
    Team.find()
        .select('-__v')
        .then(snapshot => {
            let teams = [];
            let tamanho = snapshot.length;
            let i = 0;
            let obj = [];

            if(snapshot.length > 10){
                while(i < 10 && tamanho > 0){
                    if(i < 9){
                        obj.push(snapshot[i]);
                        i++;
                        tamanho--;
                    }else{
                        teams.push(obj);
                        obj = [];
                        i = 0;
                    }
                }
            }else teams = snapshot;

            const response = {
                count: snapshot.length,
                teams: teams
            };

            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}); //READY

router.post('/', checkAuth, (req, res, next) => {
    const team = new Team({
        id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        members: req.body.members,
        inscDate: Date.now()
    });

    team.save().then(result => {
        res.status(201).json({
            message: "New team created",
            team: result,
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

router.get('/:teamInscDate', (req,res,next) => {
    const inscDate = req.params.teamId;

    Team.find({ inscDate: inscDate })
        .then(snapshot => {
            if(snapshot){
                teams: {

                }
                res.status(200).json(snapshot);
            }else{
                res.status(404).json({
                    message: "Nenhum time nessa data de inscrição"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        }
    );
}); //READY

router.patch('/:teamId', checkAuth, (req,res,next) => {
    const id = req.params.teamId;
    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Team.update({_id: id}, { $set: updateOps })
        .then(result => {
            res.status(200).json({
                message: "Team updated",
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

router.delete('/:teamId', checkAuth, (req,res,next) => {
    const id = req.params.teamId;

    Team.findByIdAndRemove({ _id: id })
        .then(result => {
            if(result){
                res.status(200).json({
                    message: "Team deleted",
                    status: true
                });
            }else{
                res.status(500).json({
                    message: "Invalid team id",
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
