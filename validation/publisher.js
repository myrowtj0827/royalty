const Validator = require("validator");
const isEmpty = require("is-empty");
const validatePhoneNumber = require('validate-phone-number-node-js');

module.exports = function validatePublisher(data){
    let msg = {};
    let email = data.email;
    // Convert empty fields to an empty string so we can use validator functions
    data.name = !isEmpty(data.name) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.phone = !isEmpty(data.phone.toString()) ? data.phone.toString() : "";
    data.country = !isEmpty(data.country) ? data.country : "";
    data.bank_info = !isEmpty(data.bank_info) ? data.bank_info : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";

    if(Validator.isEmpty(data.name)){
        msg.name = "User name field is required";
    }
    if(Validator.isEmpty(data.phone)){
        msg.phone = "Phone number field is required";
    } else if(!validatePhoneNumber.validate(data.phone) || data.phone.length > 11){
        msg.phone = "Phone number is invalid";
    }
    if(Validator.isEmpty(data.email)){
        msg.email = "Email field is required";
    } else if(!Validator.isEmail(data.email)){
        msg.email = "Email is invalid";
    }
    if(Validator.isEmpty(data.bank_info)){
        msg.bank_info = "Bank information field is required";
    }

    if(Validator.isEmpty(data.password)){
        msg.password = "Password field is required";
    }
    if(Validator.isEmpty(data.confirm_password)){
        msg.confirm_password = "Confirm password field is required";
    }
    if(!Validator.isLength(data.password, {min: 6, max: 30})){
        msg.password = "Password must be at least 6 characters";
    }
    if(!Validator.equals(data.password, data.confirm_password)){
        msg.password = "Passwords do not match. Please try again.";
    }
    return {
        msg: msg,
        isValid: isEmpty(msg),
    };
};
