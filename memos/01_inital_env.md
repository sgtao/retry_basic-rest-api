# 01_initial_env

- 『環境構築と Hello World』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=DrxcoMMgZKg&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=2

## npm initialize, and install packages

1. npm initialize and edit `package.json`

```
npm init
```

- `package.json` is following setting(JSON):

```JSON
{
  "name": "trace-basic-rest-api",
  "version": "1.0.0",
  "description": "とらゼミ「WebAPIハンズオン」を実装してみる",
  "main": "app/app.js",
  "scripts": {
    "start": "node-dev app/app.js",
    "connect": "sqlite3 app/db/database.sqlite3",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Shogo Ogami",
  "license": "MIT"
}
```

2. install packages

- install using npm

```
npm install node-dev express sqlite3 body-parser --save-dev
```

## first implement

- implement `app/app.js`

```JavaScript
const express = require('express')
const app = express()
//
// define express method
app.get('/api/v1/hello', (req, res) => {
  res.json({ "message": "Hello, World!" })
})
//
// define port, start listen
const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF
```

- run `npm start`

```
npm run start
# > trace-basic-rest-api@1.0.0 start
# > node-dev app/app.js
# Listen on port : 3000
```

- access via chrome or curl to http://localhost:3000/api/v1/hello

```
{"message":"Hello, World!"}
```

or

```
curl -X GET http://localhost:3000/api/v1/hello
# {"message":"Hello, World!"}
```
