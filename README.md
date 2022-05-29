# retry_basic-rest-api

- retry courses of ToraHack's "basic-rest-api"
  - もう一度「WebAPI ハンズオン」を実装してみる
  - refer Utube : https://www.youtube.com/watch?v=9GGRICOjA4c&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA
  - refer GitHub : https://github.com/deatiger/basic-rest-api

## 参照サイト

- 【とらゼミ】チャンネルの「Re:ゼロから始める Web API 入門【基礎編】」のメモ
  - refer Youtube : https://www.youtube.com/playlist?list=PLX8Rsrpnn3IVsi0NIDP3yRlFCS0uOZdqv
- 【とらゼミ】チャンネルの「Re:ゼロから始める Web API 入門【実践編】」のメモ
  - refer Youtube : https://www.youtube.com/watch?v=9GGRICOjA4c&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA

## 使用方法

1. install

```shell
npm install
```

2. run rest and web server

```shell
npm run start
```
  - after run, access to 3000 port of this host

  ```shell
  # get users list
  curl -X GET http://localhost:3000/api/v1/users/ | jq
  # get specified user info
  curl -X GET http://localhost:3000/api/v1/users/3 | jq
  # search by user name
  curl -X GET http://localhost:3000/api/v1/search?q=subaru | jq
  ```
  - or browse to `http://localhost:3000/` by chrome-browser, etc.

3. build
  - not supported.
  

## LICENSE

The source code is licensed MIT.
