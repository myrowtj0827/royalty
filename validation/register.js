const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data){
	let msg = {};
	let email = data.email;
	// Convert empty fields to an empty string so we can use validator functions
	data.name = !isEmpty(data.name) ? data.name : "";
	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";
	data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";
	data.role = !isEmpty(data.role) ? data.role : "";
	if(email !== undefined) { // registration only
		if(Validator.isEmpty(data.name)){
			msg.name = "User name field is required";
		}
		if(Validator.isEmpty(data.email)){
			msg.email = "Email field is required";
		} else if(!Validator.isEmail(data.email)){
			msg.email = "Email is invalid";
		}
		if(Validator.isEmpty(data.accept_state)){
			msg.accept_state = "You should accept to the Terms of Service.";
		}
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
