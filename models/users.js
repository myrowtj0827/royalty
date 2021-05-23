const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Brand schema
 */
const UserSchema = new Schema({
    role: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    origin_password: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    currency: {
        type: String,
        required: false,
    },

    bank_info: {
        type: String,
        required: false,
    },

    total_amount: {
        type: Number,
        default: 0,
    },
    current_paid: {
        type: Number,
        default: 0,
    },
    owed_amount: {
        type: Number,
        default: 0,
    },

    paid_log: {
        type: Array,
        required: false,
    },

    registered_date: {
        type: Date,
        required: true,
    },
    updated_date: {
        type: Date,
        required: false,
    },
    deleted_date: {
        type: Date,
        required: false,
    },
});

module.exports = User = mongoose.model("users", UserSchema);
