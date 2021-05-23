module.exports = {
	TRIAL_PERIOD: 1, // free trial period
	PENDING_EXPIRATION: 172800000, // 48 hours in milliseconds
	VERIFY_EXPIRATION: 172800000, // 48 hours in milliseconds
	PASSWORD_LENGTH: 20, // length of generated password
	EXPIRESIN: 31556926,

	/**
	 * MongoDB URL from system environment variable "MONGO_URL".
	 */
	// MONGO_URL: "mongodb://127.0.0.1:27017/track_royalty",
	MONGO_URL: "mongodb+srv://royalty:track-royalty@cluster0.nl5do.mongodb.net/test",

	/**
	 * Secret key for JWT
	 */
	PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----\n" +
		"MIICXQIBAAKBgQCUjZY+4dXOiDAOBRb07iGKQzhUokQcEnoCaCr2HTbqd6nJSK5N\n" +
		"Sm5wQBb+DMqqA4KkRptlW1KpuiYJbg150NODgfXKgoUHsJsGsrcMBDWXfJfMWm7e\n" +
		"CZrWP5swkjQLTv4ugpwUl6WF9egsB7MFoOpa3OQ/nFRr81uRcGf2MJQQJQIDAQAB\n" +
		"AoGAZ8WkgBbYeacPEqwhhkXXLjOY5R5ZP9b0XjwQTs7HrvCarZ5VDG8DSOysYxni\n" +
		"dPNwznr4UMyDqUb9DTdQuJjVN4FWwkEMRmXt6mXpdpugJ/te8sQSzt3tmkjnTfuJ\n" +
		"DqMUG0HqXNK49KhP+b4ONnIcRuMu0GaWLPBvKdjW6vvxc10CQQDvfK/75KED9JgM\n" +
		"lGb9JcF8En+ippPBcicPNBKc0wjlMZ2UN4nZ/noClDLiso0yhk9sbXoooaTSajAH\n" +
		"KBooE31jAkEAnsvGkMRniM9uBJ8VIG7wRQEdCUIDfwpKn2Lmwyn8GW3Tyu/gEmMM\n" +
		"O/OHzDtMo8Q2kQyc0FXLNoEjuNEqGJfW1wJBANP8P96teuWAbdK8zgkIkaMc0MQN\n" +
		"xT53qCFqC4urtfUCnSSkoK5I9oEv43cNa7SsdMNaiMZMhxQGEKtVEQomblcCQDPF\n" +
		"rlSOpE7XikAZebLcWJu21DerfSZTPacfgKsKqjXEN/QHJx/3iQqWyKSOhNsz4rKB\n" +
		"0TKfdiSsD/B2yWnBP3sCQQDSYnMrbEhZRWyyshVD6LauP16q8mAnmFaiP4w1G8ik\n" +
		"LZpemwVix/f3Q+tGt41gyQv3bp7/kIkajwZref0Y3Kjo\n" +
		"-----END RSA PRIVATE KEY-----",
	PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\n" +
		"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUjZY+4dXOiDAOBRb07iGKQzhU\n" +
		"okQcEnoCaCr2HTbqd6nJSK5NSm5wQBb+DMqqA4KkRptlW1KpuiYJbg150NODgfXK\n" +
		"goUHsJsGsrcMBDWXfJfMWm7eCZrWP5swkjQLTv4ugpwUl6WF9egsB7MFoOpa3OQ/\n" +
		"nFRr81uRcGf2MJQQJQIDAQAB\n" +
		"-----END PUBLIC KEY-----",
	SECRET_KEY: "MIICWQIBAAKBgEy3YzkLsosLAJoxWyYNUUWH5wAyq2DSK8IAPJm7r34CqlYNyNSk",

	// SIM_API_URL: "http://127.0.0.1:7000",
	// SIM_API_URL: "https://royalties.jewishmusic.fm",

	// SIM_API_URL: "http://167.86.96.120:7000",
	SIM_API_URL: "https://trackroyaltyapi.herokuapp.com",
};
