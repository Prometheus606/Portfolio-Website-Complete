// this script encrypts any given passwort and log it in the console.

const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const encrypt = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Password hash:", passwordHash);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
};

rl.question("Enter password to encrypt: ", async (password) => {
  await encrypt(password);
});
