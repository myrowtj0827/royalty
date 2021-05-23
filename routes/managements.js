const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const Users = require("../models/users");
const Albums = require("../models/add-albums");
const Tracks = require("../models/registered-tracks");
const validateRole = require("../validation/role-auth");
// const jwt = require("jsonwebtoken");

/**
 * Getting album By one id from the existing site
 */
router.all("/get-tracks", async (req, res) => {
    try {
        console.log(req.body, " = Getting album By one id from the existing site ");
        const temp = await Albums.findOne({
            album_id: req.body.album_id,
            publisher_id: req.body.user_id,
        });

        if(temp) {
            const user_temp = await Users.findOne({
                _id: mongoose.Types.ObjectId(req.body.user_id)
            });

            let sTemp;
            if ( req.body.role && req.body.role === "admin" ) {
                sTemp = await Tracks.find({
                    album_id: req.body.album_id,
                });
            } else {
                sTemp = await Tracks.find({
                    album_id: req.body.album_id,
                }, [ '-url' ]);
            }
            const result = {
                publisher_name: user_temp.name,
                album: temp,
                tracks: sTemp,
                currency: user_temp.currency,
            };
            return res.status(200).json({results: result});
        } else {
            return res.status(400).json({msg: "Such assigned album does not exist."});
        }
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Update the track payment amount by admin
 */
router.all("/update-track", async (req, res) => {
    // Check validation
    const {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    const data = req.body;
    if (Number(data.price) === 0) {
        return res.status(400).json({msg: "Please input the price correctly."})
    }
    const sTemp = await Tracks.findOne({
        album_id: data.album_id,
        name: data.track_name,
    });
    if(!sTemp) {
        return res.status(400).json({msg: "Such track does not exist."})
    } else {
        await Tracks.updateOne({
            _id: mongoose.Types.ObjectId(sTemp._id)
            },
            {
                amount_per_one: data.price,
                updated_date: new Date().toUTCString([], {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            })
            .then(() => {
                return res.status(200).json({msg: "The payment information has updated successfully."})
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            })
    }
});
/**
 * Update the track's price per album amount by admin
 */
router.all("/update-price-per-album", async (req, res) => {
    // Check validation
    const {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    const data = req.body;
    if (Number(data.price) === 0) {
        return res.status(400).json({msg: "Please input the price correctly."})
    }
    const sTemp = await Albums.findOne({
        album_id: data.album_id,
    });
    if(!sTemp) {
        return res.status(400).json({msg: "Such Album does not exist."})
    } else {
        await Albums.updateOne({
                _id: mongoose.Types.ObjectId(sTemp._id)
            },
            {
                amount_per_one: data.price,
                updated_date: new Date().toUTCString([], {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            })
            .then(() => {
                return res.status(200).json({msg: "The payment information has updated successfully."})
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            })
    }
});
/**
 * Update the paid amount
 */
router.all("/update-paid", async (req, res) => {
    // Check validation
    const {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    const data = req.body;
    if (Number(data.paid_amount) === 0) {
        return res.status(400).json({msg: "Please input the paid amount correctly."})
    }
    const sTemp = await Users.findOne({
        _id: mongoose.Types.ObjectId(data.publisher_id),
    });
    if(!sTemp) {
        return res.status(400).json({msg: "Such publisher does not exist."})
    } else {
        const paid_log = {
            paid_amount: Number(data.paid_amount).toFixed(5),
            paid_comment: data.comments.charAt(0).toUpperCase() + data.comments.slice(1),
            paid_date: new Date(data.paid_date).toUTCString([], {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }),
            registered_date: new Date().toUTCString([], {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
        await Users.updateOne({
                _id: mongoose.Types.ObjectId(data.publisher_id),
            },
            {
                $push: {
                    paid_log: paid_log
                },
                $set: {
                    current_paid: (Number(sTemp.current_paid) + Number(data.paid_amount)).toFixed(5),
                    owed_amount: Number(sTemp.owed_amount - data.paid_amount).toFixed(5),
                    updated_date: new Date().toUTCString([], {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }
            })
            .then(() => {
                return res.status(200).json({msg: "The payment information has updated successfully."})
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            })
    }
});
module.exports = router;