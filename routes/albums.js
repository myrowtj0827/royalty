const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const Users = require("../models/users");
const Albums = require("../models/add-albums");
const Tracks = require("../models/registered-tracks");
const validateRole = require("../validation/role-auth");
/**
 * Getting album list from the existing site
 */
/** Checked **/
router.all("/get-albums-jewishmusic", async (req, res) => {
    console.log(req.body, " =  Getting album list from the existing site");
    try {
        const {msg, isValid} = await validateRole(req.body.role_id);
        // Check validation
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }

        let list;
        await axios({
            method: 'get',
            url: req.body.link,
        })
            .then(res => {
                list = res.data;
                delete list["status"];
            })
            .catch(err => {
                return res.status(400).json({msg: err.response.data.message});
            });

        let album_ids = [];
        const temp = await Albums.find({});
        for (let k = 0; k < temp.length; k ++) {
            album_ids.push(temp[k].album_id);
        }
        Object.keys(list).map((item, key) => {
            if(album_ids.includes(list[key].id.toString())) {
                list[key].state = 1; // the registered album
            } else {
                list[key].state = 0; // list[key].id.state = 0;
            }
        });
        return res.status(200).json({results: list});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Getting album By one id from the existing site
 */
/** Checked **/
router.all("/get-byid-jewishmusic", async (req, res) => {
    console.log( req.body, " = Getting album By one id from the existing site ");
    try {
        const {msg, isValid} = await validateRole(req.body.role_id);
        // Check validation
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }

        let url = "https://jewishmusic.fm/jmusic/albums/get_album?album_id=" + req.body.id + "&lang=" + req.body.lang;
        let album_info;
        await axios({
            method: 'get',
            url: url,
        })
            .then(res => {
                album_info = res.data["post"];
            })
            .catch(err => {
                return res.status(400).json({msg: err.response.data.message});
            });

        let track_ids = [];
        const temp = await Tracks.find({
            album_id: req.body.id,                        /** filtering by album_id  **/
        });
        for (let k = 0; k < temp.length; k ++) {
            track_ids.push(temp[k].url);                   // Identifying by Track URL and language
        }

        album_info.tracks.map((item, key) => {
            if(track_ids.includes(item.url.toString())) {
                album_info.tracks[key].state = 1;          // the registered track
            } else {
                album_info.tracks[key].state = 0;
            }
        });
        return res.status(200).json({results: album_info});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/** Checked **/
router.all("/add-album", async (req, res) => {
    console.log( req.body, " = Adding new Album from the exiting site");
    try {
        const {msg, isValid} = await validateRole(req.body.role_id);
        // Check validation
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        let idArray = req.body.id;
        if(idArray.length === 0) {
            return res.status(400).json({msg: "Please choose the albums."})
        }
        let fail_ids = [];
        let success_ids = [];
        for (let i = 0; i < idArray.length; i ++) {
            const temp = await Albums.findOne({album_id: idArray[i]});
            if (temp) {
                return res.status(400).json({msg: "You have already registered this album. But you can use the above input filed to check the detailed registration status of the tracks included in requested albums."})
            } else {
                try {
                    let url = "https://jewishmusic.fm/jmusic/albums/get_album?album_id=" + idArray[i] + "&lang=" + req.body.lang;
                    let album_info;
                    await axios({
                        method: 'get',
                        url: url,
                    })
                        .then(res => {
                            album_info = res.data["post"];
                        })
                        .catch(err => {
                            return res.status(400).json({msg: err.response.data.message});
                        });
                    console.log(i, ": ", idArray[i], " -> ", url);
                    console.log(album_info, " = album_info ");
                    /**
                     * Filtering the tracks
                     */
                    let tracks = album_info["tracks"];
                    let trackArray = [];
                    let array = [];
                    for (let k = 0; k < tracks.length; k ++) {
                        let temp = await Tracks.findOne({
                            track: tracks[k].url,
                            album_id: req.body.id,
                        });
                        if(!temp) {
                            trackArray.push(tracks[k]);
                            array.push({
                                album_id: idArray[i],
                                url: tracks[k].url,
                                name: tracks[k].title,
                                language: req.body.lang,
                                download: tracks[k].download,
                                registered_date: new Date().toUTCString([], {
                                    year: 'numeric',
                                    month: 'long',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }),
                            });
                        }
                    }
                    /**
                     * Registering the tracks
                     */
                    if(array.length > 0) {
                        success_ids.push(idArray[i]);
                        await Tracks.insertMany(array);
                        const newAlbum = new Albums ({
                            album_id: idArray[i],
                            name: album_info["title"],
                            tracks: trackArray,
                            language: req.body.lang,
                            artists: album_info["taxonomy_artists"],
                            thumbnail: album_info["thumbnail"],
                            full_thumbnail: album_info["thumbnail_images"].full.url,
                            path: album_info["buttons"],
                            registered_date: new Date().toUTCString([], {
                                year: 'numeric',
                                month: 'long',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
                        });
                        await newAlbum.save();
                        console.log("An album with id " + idArray[i] + " are registered.");
                    } else {
                        fail_ids.push(idArray[i]);
                    }
                } catch (e) {
                    return res.status(400).json({msg: e.toString()});
                }
            }
        }
        let msgs;
        if (success_ids.length > 0) {
            msgs = "The albums with id " + success_ids + " are registered.";
            if (fail_ids.length > 0) {
                msgs += "The registration of the albums with id " + fail_ids + " are failed, because the related tracks have already registered.";
            }
        } else {
            msgs += "The registration of the albums with id " + fail_ids + " are failed, because the related tracks have already registered.";
        }
        return res.status(200).json({msg: msgs});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Registration of the tracks
 */
/** Checked **/
router.all("/add-track", async (req, res) => {
    console.log(req.body, " = Registration of the tracks");
    try {
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        let album = req.body.album;
        let idArray = req.body.tracks_url;
        let trackArray = []; // the track array to add newly
        let checkTrack = []; // already the registered track array
        let flag = 0;
        if(idArray.length === 0) {
            return res.status(400).json({msg: "Please choose the track."})
        } else {
            const temp = await Albums.findOne({album_id: album.id});
            if(temp) {
                checkTrack = temp.tracks;
            }
            for (let k = 0; k < idArray.length; k ++) {
                let m = 0;
                for (let i = 1; i <= checkTrack.length; i ++) {
                    if(checkTrack[i-1].url === idArray[k]) {
                        m = i;
                    }
                }
                if(m === 0) {
                    flag += 1;
                    trackArray.push({
                        url: idArray[k],
                        album_id: album.id,
                        name: req.body.tracks[k].title,
                        language: req.body.tracks[k].lang,
                        download: req.body.tracks[k].download,
                        registered_date: new Date().toUTCString([], {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    });
                    checkTrack.push(req.body.tracks[k])
                }
            }
            if(temp) {
                await Albums.updateOne({
                        _id: mongoose.Types.ObjectId(temp._id)
                    },
                    {
                        tracks: checkTrack,
                        updated_date: new Date().toUTCString([], {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    });
            } else {
                const newAlbum = new Albums ({
                    album_id: album.id,
                    name: album.title,
                    tracks: checkTrack,
                    language: req.body.lang,
                    artists: album.taxonomy_artists,
                    thumbnail: album.thumbnail,
                    path: album.buttons,
                    registered_date: new Date().toUTCString([], {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                });
                await newAlbum.save();
                console.log("An Album with id " + album.id + " are registered successfully.");
            }
        }
        await Tracks.insertMany(trackArray);
        let msgs = flag > 1? flag + " tracks are registered successfully." : flag + " track is registered successfully.";
        return res.status(200).json({msg: msgs});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Cancel the album registration from the existing site
 */
/** Checked **/
router.all("/delete-album", async (req, res) => {
    try {
        console.log(req.body, " = Cancel the album registration from the existing site ");
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        if(req.body.albums.length === 0) {
            return res.status(400).json({msg: "Please choose the albums."})
        }
        for (let k = 0; k < req.body.albums.length; k ++) {
            /**
             * Removing from the registered tracks
             */
            let url = "https://jewishmusic.fm/jmusic/albums/get_album?album_id=" + req.body.albums[k];
            // let url = "https://jewishmusic.fm/jmusic/albums/get_album?album_id=" + req.body.albums[k] + "&lang=" + req.body.language;
            let album_info;
            await axios({
                method: 'get',
                url: url,
            })
                .then(res => {
                    album_info = res.data["post"];
                })
                .catch(err => {
                    return res.status(400).json({msg: err.response.data.message});
                });
            /**
             * Filtering the tracks
             */
            let tracks = album_info["tracks"];
            let array = [];
            for (let k = 0; k < tracks.length; k ++) {
                array.push(tracks[k].url);
            }
            await Tracks.deleteMany({
                url: {$in: array},
                album_id: req.body.albums[k]
            })
                .then(() => {

                }).catch(err => {
                    return res.status(400).json({msg: err.toString()});
                });

            const temp = await Albums.findOne({album_id: req.body.albums[k]});
            if (temp) {
                await Albums.deleteOne({album_id: req.body.albums[k]})
                    .then(() => {
                    }).catch(e => {
                        return res.status(400).json({msg: e.toString()});
                    });
            } else {
                return res.status(400).json({msg: "Such album Id does not exist in the database."})
            }
        }
        return res.status(200).json({msg: "You have successfully canceled the registration of these albums with id " + req.body.albums});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Cancel the tracks registered from the existing site
 */
router.all("/delete-track", async (req, res) => {
    try {
        console.log(req.body, " = Cancel the tracks registered from the existing site ");
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        if(req.body.tracks.length === 0) {
            return res.status(400).json({msg: "Please choose the track."})
        }
        let tracks = req.body.tracks; // track list to delete from Track
        let temp = await Albums.findOne({album_id: req.body.id});
        let array_update = [];// track array to update
        if (temp) {
            array_update = temp.tracks;
        }
        /**
         * Filtering the tracks
         */
        for (let k = 0; k < tracks.length; k ++) {
            if(temp) {
                let m = 0;
                for (let i = 1; i <= array_update.length; i ++) {
                    if(array_update[i - 1].url === tracks[k]) {
                        m = i;
                    }
                }
                if(m !== 0) {
                    array_update.splice(m - 1, 1);
                }
            }
        }
        await Tracks.deleteMany({url: {$in: tracks}})
            .then(() => {
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            });
        if (array_update.length === 0) {
            await Albums.deleteOne({album_id: req.body.id})
                .then(() => {
                }).catch(e => {
                    return res.status(400).json({msg: e.toString()});
                });
        } else {
            await Albums.updateOne({
                    album_id: req.body.id,
                },
                {
                    tracks: array_update,
                })
                .then(() => {})
                .catch(e => {
                    return res.status(400).json({msg: e.toString()});
                });
        }
        return res.status(200).json({msg: "You have successfully canceled " + tracks.length + " tracks from the registered album with id " + req.body.id});
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});


/**
 * Getting the registered albums
 */
/** Checked **/
router.all("/get-registered-albums", async (req, res) => {
    try {
        console.log(req.body, " = Getting the registered albums ");
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        const pagination = req.body.pagination ? parseInt(req.body.pagination) : 10;
        const page_number = req.body.current_page ? parseInt(req.body.current_page) : 2;
        const page_neighbours = req.body.page_neighbours ? parseInt(req.body.page_neighbours) : 1;

        const total_list_count = await Albums.collection.countDocuments({$and: [{publisher_id: null}]});
        const total_page = Math.ceil(total_list_count/pagination);

        const start_page = Math.max(1, page_number - page_neighbours);
        const end_page = Math.min(total_page, page_number + page_neighbours);
        const page_num = {
            start_page: start_page,
            end_page: end_page,
            total_page: total_page,
        };

        await Albums.find({$and: [{publisher_id: null}]})
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
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Searching the registered Album
 */
router.all("/search-registered-album", async (req, res) => {
    try {
        console.log(req.body, " = Searching the registered album");
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }
        const page_num = {
            start_page: 1,
            end_page: 1,
            total_page: 1,
        };
        await Albums.find({
            $and: [{publisher_id: null}],
            album_id: req.body.album_id,
        })
            .then(temp => {
                const result = {
                    list: temp,
                    page_num: page_num,
                };
                return res.status(200).json({results: result});
            }).catch(err => {
                return res.status(400).json({msg: err.toString()});
            })
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});

/**
 * Assigning Albums
 */
/** Checked **/
router.all("/assign-albums", async (req, res) => {
    try {
        console.log(req.body, ' =  Assigning Albums ');
        // Check validation
        const {msg, isValid} = await validateRole(req.body.role_id);
        if(!isValid) {
            return res.status(400).json({msg: msg});
        }

        if(req.body.publisher_id === '') {
            return res.status(400).json({msg: "Please choose the publisher."})
        } else {
            if(req.body.new_checked.length === 0) {
                return res.status(400).json({msg: "Please choose the albums you want to assign."})
            } else {
                let idArray = req.body.new_checked;

                for (let i = 0; i < idArray.length; i ++) {
                    await Albums.updateOne({
                            _id: mongoose.Types.ObjectId(idArray[i])
                        },
                        {
                            publisher_id: req.body.publisher_id,
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
                }

                const user_info = await Users.findOne({_id: mongoose.Types.ObjectId(req.body.publisher_id)});
                return res.status(200).json({msg: idArray.length + " albums have assigned to the " + user_info.name});
            }
        }
    } catch (e) {
        return res.status(400).json({msg: e.toString()});
    }
});
/**
 * Getting the Assigned albums
 */
/** Checked **/
router.all("/get-assigned-albums", async (req, res) => {
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 10;
    const page_number = req.body.current_page ? parseInt(req.body.current_page) : 2;
    const page_neighbours = req.body.page_neighbours ? parseInt(req.body.page_neighbours) : 1;

    const total_list_count = await Albums.collection.countDocuments({publisher_id: req.body.id});
    const total_page = Math.ceil(total_list_count/pagination);

    const start_page = Math.max(1, page_number - page_neighbours);
    const end_page = Math.min(total_page, page_number + page_neighbours);
    const page_num = {
        start_page: start_page,
        end_page: end_page,
        total_page: total_page,
    };

    const user_info = await Users.findOne({
        _id: mongoose.Types.ObjectId(req.body.id),
    });
    if(!user_info) {
        return res.status(400).json({msg: "The publisher can not find."})
    }

    await Albums.find({publisher_id: req.body.id})
        .collation({locale: 'en', strength: 2})
        .sort({name: 1})
        .skip((page_number - 1) * pagination)
        .limit(pagination)
        .then(temp => {
            let paid_history = user_info.paid_log;
            let len = paid_history.length;
            if (len > 10) {
                paid_history = paid_history.slice(len - 10, len);
            }
            const result = {
                paid_history: paid_history,
                publisher_name: user_info.name,
                currency: user_info.currency,
                list: temp,
                page_num: page_num,
            };
            return res.status(200).json({results: result});
        }).catch(err => {
            return res.status(400).json({msg: err.toString()});
        })
});




/**
 * Cancel the assigned album to user
 */
router.all("/unassign-albums-user", async (req, res) => {
    // Check validation
    const {msg, isValid} = await validateRole(req.body.role_id);
    if(!isValid) {
        return res.status(400).json({msg: msg});
    }

    let array = req.body.new_checked;
    if(array.length === 0) {
        return res.status(400).json({msg: "Please choose the albums."})
    }

    for (let k = 0; k < array.length; k ++) {
        await Albums.updateOne({
                _id: mongoose.Types.ObjectId(array[k])
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
    }
    return res.status(200).json({msg: "You have successfully canceled the assigning of these albums."});
});
module.exports = router;