const searchModule = (() => {
  // const BASE_URL = "http://localhost:3000/api/v1/search";
  const hostname_l = location.hostname
  const portnum_l  = location.port
  const BASE_URL = `http://${ hostname_l }:${ portnum_l }/api/v1/search`

  return {
    searchUsers: async () => {
      // 検索窓への入力を取得
      const query = document.querySelector("#search").value
      const dispatch_path = BASE_URL + '?q=' + query
      console.dir('search ' + query + ' by access to ' + dispatch_path)
      // axios でのユーザ情報取得
      let result = []
      await axios.get(dispatch_path)
        .then((axios_res) => {
          // handle success
          console.log(axios_res)
          result = axios_res.data
        })
        .catch(function (error) {
          // handle error
          console.log(error)
        })
      console.dir(result);
      let body = ""

      for (let i = 0; i < result.length; i++) {
        const user = result[i]
        body += `<tr>
                  <td>${user.id}</td>
                  <td>${user.name}</td>
                  <td>${user.profile}</td>
                  <td>${user.date_of_birth}</td>
                  <td>${user.created_at}</td>
                  <td>${user.updated_at}</td>
                </tr>`
      }
      document.querySelector('#users-list').innerHTML = body
    }
  }
})();