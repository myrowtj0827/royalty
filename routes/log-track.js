const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Users = require("../models/users");
const Albums = require("../models/add-albums");
const Tracks = require("../models/registered-tracks");
const getIP = require('ipware')().get_ip;
const geoip = require('geoip-country');

const jwt = require("jsonwebtoken");
const config = require("../config");
/**
 * Update the track played info From Existing site
 */
router.all("/add-played-track", async (req, res) => {
    /**
     * album_id,
     * track_name,
     */
    // To make the JWT more efficient we need 3 things
    const iss 	= 'Track Loyalty';			// Issuer (Software organization who issues the token)
    const sub 	= 'some@user.com';			// Subject (intended user of the token)
    const aud 	= config.SIM_API_URL;	// Audience (Domain within which this token will live and function)
    const exp   = config.EXPIRESIN;
    const alg   = ["RS256"];

    try {
        /**
         * JST Verify
         */
        const verifyOptions = {
            issuer: 	iss,
            subject: 	sub,
            audience: 	aud,
            expiresIn: 	exp,
            algorithm: 	alg,
        };
        const legit = await jwt.verify(req.headers.authorization, config.PUBLIC_KEY, verifyOptions);
        console.log("\nJWT verification result: " + JSON.stringify(legit));
        try {
            /**
             * JST Decode
             */
            const decoded = await jwt.decode(req.headers.authorization, {complete: true});
            console.log("\nDecoded jwt: "+ JSON.stringify(decoded));

            /**
             * Store the track logs
             */
            const ip = getIP(req).clientIp;
            const geo = geoip.lookup(ip);
            const country = geo? geo.country: 'Unknown';

            console.log(country, " = country");
            const data = req.body;
            const temp_album = await Albums.findOne({
                album_id: data.album_id,
            });

            const sTemp = await Tracks.findOne({
                album_id: data.album_id,
                url: data.track_url,
            });

            if(!sTemp) {
                return res.status(400).json({msg: "Such track does not exist."})
            } else {
                if(!temp_album) {
                    return res.status(400).json({msg: "The album related with this track does not exist."})
                }
                const newLog = {
                    country: country,
                    ip_address: ip,
                    platform: req.body.platform,
                    version: req.body.version,
                    price_per_track: Number(sTemp.amount_per_one), // by the current set price per track
                    played_date: new Date().toUTCString([], {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                };
                const update_log = {
                    download: Number(sTemp.download) + 1,
                    total_amount: (sTemp.total_amount + sTemp.amount_per_one).toFixed(5),
                };
                //console.log(newLog, " = newLog");
                //console.log(update_log, " = updateLog");
                await Tracks.updateOne({
                        album_id: data.album_id,
                        url: data.track_url,
                    },
                    {
                        $push: {
                            details: newLog,
                        },
                        $set: update_log,
                    })
                    .then(async () => {
                        /**
                         * Album Total amount Updating
                         */
                        await Albums.updateOne({
                                album_id: data.album_id,
                            },
                            {
                                total_amount: (temp_album.total_amount + sTemp.amount_per_one).toFixed(5),
                            });
                        /**
                         * User total amount updating
                         */
                        const user_id = temp_album.publisher_id;
                        const temp_user = await Users.findOne({
                            _id: mongoose.Types.ObjectId(user_id),
                        });
                        await Users.updateOne({
                                _id: mongoose.Types.ObjectId(user_id),
                            },
                            {
                                total_amount: (temp_user.total_amount + sTemp.amount_per_one).toFixed(5),
                                owed_amount: (temp_user.owed_amount + sTemp.amount_per_one).toFixed(5),

                            });
                        return res.status(200).json({msg: "The played track information has updated successfully.", results: {ip, country}})
                    }).catch(err => {
                        return res.status(400).json({msg: err.toString()});
                    });
            }
        } catch (err) {
            return res.status(400).json({msg: err.toString()})
        }
    } catch (e) {
        return res.status(400).json({msg: e.toString()})
    }
});
module.exports = router;