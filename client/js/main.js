const app = Vue.createApp({
  data: () => ({ // define binded data
    users: [],
    keyword: '',
    message: '',
    // hostname_l: window.location.hostname,
    hostname_l: '192.168.10.9',
    portnum_l: '3000',
    base_url: "",
  }),
  watch: { // define watched data
    keyword: function (newKeyword, oldKeyword) {
      console.log(newKeyword)
      this.message = 'Waiting for you to stop typing...'
      // 入力の遅延
      this.debouncedGetAnswer()
    }
  },
  mounted: function () { // define first process at mount
    this.keyword = ''
    // this.getAnswer()
    this.fetchAllUsers()
    // 
    this.debouncedGetAnswer = _.debounce(this.fetchAllUsers, 2000)
  },
  methods: { // define methods 
    // APIからデータを取得する
    fetchAllUsers: function () {
      // await で応答を待ちながら処理する
      // axios でのユーザ情報取得
      this.base_url = "http://" + this.hostname_l + ":" + this.portnum_l + "/api/v1/users"
      let config = {
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          "mode": 'no-cors',
        },
      }
      console.log('access to ' + this.base_url)
      axios.get(this.base_url, config)
        .then((axios_res) => {
          // handle success
          console.log(axios_res)
          this.users = axios_res.data
        })
        .catch((error) => {
          // handle error
          console.log(error)
        })
    },
  },
})
app.mount('#app')