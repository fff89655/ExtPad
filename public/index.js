const electron = require('electron');

var api = require("./api.js");

let iconMap = {excel:"img/excel.png",vscode:"img/vscode.png",chrome:"img/chrome.png",else:"img/win.png"}

api.getWindowList(function(t){
    let winList = [];
    let listval = t.split("\r\n");
    for(let row of listval){
      if(!row) continue;
      
      let vs = row.split(":-:");
      let win = {handle:vs[0], title:vs[1], rect:{}};
      if(win.title.endsWith(" - Excel")){
        win.type = "excel";
        win.order = 1;
        win.title = win.title.substring(0, win.title.indexOf(" - Excel"));
      }else if(win.title.endsWith(" - Visual Studio Code")){
        win.order = 2;
        win.type = "vscode";
        win.title = win.title.substring(0, win.title.indexOf(" - Visual Studio Code"));
      }else if(win.title.endsWith(" - Google Chrome")){
        win.order = 3;
        win.type = "chrome";
        win.title = win.title.substring(0, win.title.indexOf(" - Google Chrome"));
      }else{
        win.order = 999;
        win.type = "else";
        win.iconSrc = iconMap.else;
      }

      win.iconSrc = iconMap[win.type];
      winList.push(win);
    }
    // for(let win of winList){
    //     api.getWindowRect(win.handle, r=>{
    //         win.rect = r;
    //     });
    // }
    winList.sort((a, b) => {
        return a.order > b.order ? 1 : -1;
    });
    appData.winList = winList;
    initVue();
});




let appData = {winList:[]}
function initVue(){
  new Vue({
    el: '#app',
    data: appData,
    methods: {
      onWinClick: function(win){
        api.getWindowRect(win.handle, r=>{
            if(r.x < -10000){
                api.setTopWindow(win.handle, true);
            }else{
                api.setTopWindow(win.handle);
            }
        });
      }
    }
  })
}