// this script generates a random user name from the words in the files nouns.js and adjectives.js

const nounce = require("./nouns")
const adjectives = require("./adjectives")

function generateRandomUserName() {
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nounce[Math.floor(Math.random() * nounce.length)]}`
}

module.exports = generateRandomUserName