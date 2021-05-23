const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Brand schema
 */
const TrackSchema = new Schema({
    album_id: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    download: {
        type: Number,
        required: false,
    },

    amount_per_one: {
        type: Number,
        default: 10,
    },
    total_amount: {
        type: Number,
        default: 0,
    },


    language: {
        type: String,
        required: false,
    },

    /**
     * Including country, ip address, payment amount
     */
    details: {
        type: Array,
        required: false,
    },

    registered_date: {
        type: Date,
        required: false,
    },
    updated_date: {
        type: Date,
        required: false,
    },

    /**
     * Paid history by publisher
     * amount and paid date
     */
    paid_history: {
        type: Array,
        required: false,
    },
});

module.exports = Track = mongoose.model("track", TrackSchema);
