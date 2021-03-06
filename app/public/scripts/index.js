const indexModule = (() => {
  const path = window.location.pathname;

  switch (path) {
    case '/' : 
      // 検索ボタンのイベントを追加
      document.querySelector("#search-btn").addEventListener('click', ()=>{
        return searchModule.searchUsers();
      });
      // Usersモジュールのfetchを実行
      return usersModule.fetchAllUsers();

    case '/create.html' : 
      // 保存ボタン・キャンセルボタンのイベントを追加
      document.querySelector("#save-btn").addEventListener('click', ()=>{
        return usersModule.createUser();
      });
      document.querySelector("#cancel-btn").addEventListener('click', ()=>{
        return window.location.href = "/"; // ホーム画面に戻る
        // return window.close(); // 新規作成ウィンドウを閉じる
      });
      break;
      
    case '/edit.html' : 
      // URLからパラメータuidを取得する
      // refer : https://qiita.com/sventouz/items/36859c7730dcfcbeadf4
      const uid = window.location.search.split( '?uid=')[1];

      // 保存ボタン・キャンセルボタンのイベントを追加
      document.querySelector("#save-btn").addEventListener('click', ()=>{
        return usersModule.saveUser(uid);
      });
      document.querySelector("#cancel-btn").addEventListener('click', ()=>{
        return window.location.href = "/"; // ホーム画面に戻る
        // return window.close(); // 新規作成ウィンドウを閉じる
      });
      document.querySelector("#delete-btn").addEventListener('click', () => {
        return usersModule.deleteUser(uid);
      });

      return usersModule.setExistingValue(uid);
      
    default :
      break;
  }
})();