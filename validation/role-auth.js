const Validator = require("validator");
const isEmpty = require("is-empty");
const mongoose = require('mongoose');
const Users = require("../models/users");


module.exports = async function validateRole (data){
    let msg = {};
    let psw = data;
    // Convert empty fields to an empty string so we can use validator functions
    data = !isEmpty(data) ? data : "";

    // Email checks
    if(Validator.isEmpty(data)){
        msg = "Please try the correct login.";
    } else {
        const temp = await Users.findOne({
            _id: mongoose.Types.ObjectId(data),
        });

        if(!temp) {
            msg = "You have tried as the wrong role. Please try the correct login.";
        } else {
            if(temp.role === "publisher") {
                msg = "You have tried as the wrong role. Please try the correct login.";
            }
        }
    }
    return {
        msg: msg,
        isValid: isEmpty(msg)
    };
};
