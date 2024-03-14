// generates a random password

const randomstring = require("randomstring");

function generateKey(length) {
    return randomstring.generate({
        length,
        charset: ["alphanumeric", "!?$_-+#:.,;"]
    });
}

module.exports = generateKey

