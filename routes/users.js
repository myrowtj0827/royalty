const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Users = require("../models/users");
const Albums = require("../models/add-albums");
// Load input validators
const validateLoginInput = require("../validation/login");
const validatePublisher = require("../validation/publisher");
const validateRole = require("../validation/role-auth");
// password hash
const passwordHash = require('password-hash');
const jwt = require("jsonwebtoken");
const config = require("../config");

'use strict';
const privateKEY 	= config.PRIVATE_KEY; //fs.readFileSync('./private.key', 'utf8'); // to sign JWT

router.all("/login", async (req, res) => {
    // Form validation
    const {msg, isValid} = validateLoginInput(req.body);
    // Check validation
    if(!isValid){
        return res.status(400).json({msg: msg});
    } else {
        await Users.findOne({
            email: req.body.email,
            $and: [{deleted_date: null}],
        }).then(async temp => {
            if(temp) {
                if (passwordHash.verify(req.body.password, temp.password)) {
                    // const payload = {
                    //     id: temp._id,
                    //     email: temp.email.toLowerCase(),
                    //     password: temp.origin_password,
                    // };
                    //
                    // // Sign token by security key
                    // jwt.sign(
                    //     payload,
                    //     config.SECRET_KEY,
                    //     {
                    //         expiresIn: 31556926 // 1 year in seconds
                    //     },
                    //     async (err, token) => {
                    //         console.log(token, "token =====");
                    //
                    //         res.status(200).json({
                    //             msg: "Login succeed",
                    //             token: "Bearer " + token,
                    //             results: temp,
                    //         });
                    //     }
                    // );

                    /**
                     * Getting the token by private key
                     */
                    let temp = await Users.findOne({
                        role: 'admin',
                    });
                    const payload = {
                        id: temp._id,
                        email: temp.email,
                        password: temp.origin_password,
                    };
                    // To make the JWT more efficient we need 3 things
                    const iss 	= 'Track Loyalty';			// Issuer (Software organization who issues the token)
                    const sub 	= 'some@user.com';			// Subject (intended user of the token)
                    const aud 	= config.SIM_API_URL;	    // Audience (Domain within which this token will live and function)
                    const exp   = config.EXPIRESIN;
                    const alg   = "RS256";
                    // Token signing options
                    const signOptions = {
                        issuer: 	iss,
                        subject: 	sub,
                        audience: 	aud,
                        expiresIn: 	exp,
                        algorithm: 	alg,
                    };
                    // Sign token
                    const token = await jwt.sign(payload, privateKEY, signOptions);
                    console.log("Token :" + token);
                    return res.status(200).json({
                        msg: "Login succeed",
                        token: token,
                        results: temp,
                    });


                } else {
                    return res.status(400).json({msg: "Please input the correct password."});
                }
            } else {
                return res.status(400).json({msg: "Login failed."});
            }
        }).catch(err => {
            return res.status(400).json({msg: err.toString()});
        })
    }
});
/**
 * Create and update the publisher by the admin
 */
router.all("/create-publisher", async (req, res) => {
    let {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    } else {
        // Form validation
        let {msg, isValid} = validatePublisher(req.body);
        // Check validation
        if(!isValid){
            return res.status(400).json({msg: msg});
        } else {
            if(req.body.flag === 'create') {
                let temp = await Users.findOne({email: req.body.email});
                if(temp) {
                    return res.status(400).json({msg: 'The same email has already used. Please use the other email.'});
                } else {
                    const newUser = new Users({
                        role: 'publisher',
                        name: req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                        phone: req.body.phone,
                        country: req.body.country,
                        bank_info: req.body.bank_info,
                        currency: req.body.currency,
                        email: req.body.email,
                        password: passwordHash.generate(req.body.password),
                        origin_password: req.body.password,
                        registered_date: new Date().toUTCString([], {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                    });
                    await newUser.save();
                    return res.status(200).json({msg: "The registration has succeed."});
                }
            } else {
                await Users.collection.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(req.body.id),
                        $and: [{deleted_date: null}],
                    },
                    [{
                        $set: {
                            name: req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                            phone: req.body.phone,
                            country: req.body.country,
                            bank_info: req.body.bank_info,
                            currency: req.body.currency,
                            email: req.body.email,
                            password: passwordHash.generate(req.body.password),
                            origin_password: req.body.password,
                            updated_date: new Date().toUTCString([], {
                                year: 'numeric',
                                month: 'long',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                        }
                    }])
                    .then(() => {
                        return res.status(200).json({msg: 'This user has updated successfully.'});
                    }).catch(err => {
                        return res.status(400).json({msg: err.toString()});
                    })
            }
        }
    }
});
/**
 * Create and update the publisher oneself
 */
router.all("/update-publisher", async (req, res) => {
    // Form validation
    let {msg, isValid} = validatePublisher(req.body);
    // Check validation
    if(!isValid){
        return res.status(400).json({msg: msg});
    } else {
        await Users.collection.updateOne(
            {
                _id: mongoose.Types.ObjectId(req.body.id),
                $and: [{deleted_date: null}],
            },
            [{
                $set: {
                    name: req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                    phone: req.body.phone,
                    country: req.body.country,
                    bank_info: req.body.bank_info,
                    email: req.body.email,
                    password: passwordHash.generate(req.body.password),
                    origin_password: req.body.password,
                    updated_date: new Date().toUTCString([], {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                }
            }])
            .then(() => {
                return res.status(200).json({msg: 'The profile has updated successfully.'});
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            })
    }
});
router.all("/get-users", async (req, res) => {
    let {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    const data = {
        role: 'publisher',
        $and: [{deleted_date: null}],
    };
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 10;
    const page_number = req.body.current_page ? parseInt(req.body.current_page) : 2;
    const page_neighbours = req.body.page_neighbours ? parseInt(req.body.page_neighbours) : 1;

    const total_list_count = await Users.collection.countDocuments(data);
    const total_page = Math.ceil(total_list_count/pagination);

    const start_page = Math.max(1, page_number - page_neighbours);
    const end_page = Math.min(total_page, page_number + page_neighbours);
    const page_num = {
        start_page: start_page,
        end_page: end_page,
        total_page: total_page,
    };

   await Users.find(data, ["-password", "-origin_password"])
       .collation({locale: 'en', strength: 2})
       .sort({name: 1})
       .skip((page_number - 1) * pagination)
       .limit(pagination)
       .then(temp => {
           const result = {
               list: temp,
               page_num: page_num,
           };
           return res.status(200).json({results: result});
       }).catch(err => {
           return res.status(400).json({msg: err.toString()});
       })
});

router.all("/delete-user", async (req, res) => {
    let {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    await Users.collection.updateOne(
        { _id: mongoose.Types.ObjectId(req.body.id)},
        [{
            $set: {
                deleted_date: new Date().toUTCString([], {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            }
        }])
        .then(async () => {

            /**
             * dis-assigning the albums related with this user
             */
            await Albums.updateMany({
                    publisher_id: req.body.id,
                },
                {
                    publisher_id: null,
                    updated_date: new Date().toUTCString([], {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }).then(() => {

            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            });

            return res.status(200).json({msg: 'This user has deleted successfully.'});
        }).catch(err => {
            return res.status(400).json({msg: err.toString()});
        })
});
/**
 * Getting user info by Id
 */
router.all("/get-user", async (req, res) => {
    const data = {
        _id: mongoose.Types.ObjectId(req.body.id)
    };
    await Users.findOne(data, ["-password"])
        .then(temp => {
            return res.status(200).json({results: temp});
        }).catch(err => {
            return res.status(400).json({msg: err.toString()});
        })
});

/**
 * Getting user list
 */
router.all("/get-all-users", async (req, res) => {
    let {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }
    const data = {
        role: "publisher",
        $and: [{deleted_date: null}],
    };
    await Users.find(data,
        ["-password", "-role", "-origin_password", "-password", "-phone", "-country", "-bank_info", "-current_paid", "-registered_date", "-required_date", "-updated_date", ])
        .sort({name: 1})
        .then(temp => {
            return res.status(200).json({results: temp});
        }).catch(err => {
            return res.status(400).json({msg: err.toString()});
        })
});

/**
 * generating the Token by Security_key
 */
router.all("/get-token", async (req, res) => {
    let temp = await Users.findOne({
        role: 'admin',
    });
    const payload = {
        id: temp._id,
        email: temp.email,
        password: temp.origin_password,
    };

    // Sign token
    jwt.sign(
        payload,
        config.SECRET_KEY,
        {
            expiresIn: 31556926 // 1 year in seconds
        },
        async (err, token) => {
            console.log(token, "token =====");
            res.status(200).json({
                msg: "Getting token has succeed",
                token: "Bearer " + token,
            });
        }
    );
});

/**
 * generating the Token by Private key
 */
router.all("/get-private-token", async (req, res) => {
    let temp = await Users.findOne({
        role: 'admin',
    });
    const payload = {
        id: temp._id,
        email: temp.email,
        password: temp.origin_password,
    };

    // To make the JWT more efficient we need 3 things
    const iss 	= 'Track Loyalty';			// Issuer (Software organization who issues the token)
    const sub 	= 'some@user.com';			// Subject (intended user of the token)
    const aud 	= config.SIM_API_URL;	    // Audience (Domain within which this token will live and function)
    const exp   = config.EXPIRESIN;
    const alg   = "RS256";

    // Token signing options
    const signOptions = {
        issuer: 	iss,
        subject: 	sub,
        audience: 	aud,
        expiresIn: 	exp,
        algorithm: 	alg,
    };

    // Sign token
    const token = await jwt.sign(payload, privateKEY, signOptions);
    console.log("Token :" + token);

    return res.status(200).json({
        msg: "Getting token has succeed",
        token: token,//"Bearer " + token,
    });
});

/**
 * Searching the user by name
 */
router.all("/search", async (req, res) => {
    try {
        console.log(req.body, " = Searching the user by name");
        if (req.body.role !== "admin") {
            return res.status(400).json({msg: "You can not do this request by your permission"});
        } else {
            if (!req.body.user_name) {
                return res.status(400).json({msg: "Mistaken request"});
            }
            const data = {
                role: 'publisher',
                $and: [{deleted_date: null}, {name: {$regex: req.body.user_name, $options: "$i"}}],
            };
            await Users.find(data, ["-password", "-origin_password"])
                .then(temp => {
                    return res.status(200).json({list: temp});
                }).catch(err => {
                    return res.status(400).json({msg: err.toString()});
                })
        }
    } catch (e) {
        return res.status(200).json({msg: e.toString()});
    }
});
module.exports = router;