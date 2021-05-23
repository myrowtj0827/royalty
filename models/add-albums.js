const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Brand schema
 */
const AlbumSchema = new Schema({
    publisher_id: {
        type: String,
        required: false,
    },
    album_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    full_thumbnail: {
        type: String,
        required: false,
    },
    tracks: {
        type: Array,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    artists: {
        type: Array,
        required: false,
    },
    path: {
        type: String,
        required: false,
    },

    total_amount: {
        type: Number,
        default: 0,
    },
    amount_per_one: {
        type: Number,
        default: 0,
    },

    registered_date: {
        type: Date,
        required: true,
    },
    assigned_date: {
        type: Date,
        required: false,
    },
    updated_date: {
        type: Date,
        required: false,
    },
});

module.exports = Album = mongoose.model("albums", AlbumSchema);
