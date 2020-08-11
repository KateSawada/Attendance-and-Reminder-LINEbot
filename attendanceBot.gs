var CHANNEL_ACCESS_TOKEN = "your line api token"; 
var SPREADSHEET_ID = "spreadsheet id with sheets attendaance, hosts, and group";

function doPost(e) {

  var events = JSON.parse(e.postData.contents).events;
  events.forEach(function(event) {
    reply_message(event);
  });
}

function reply_message(e) {
  var input_text = e.message.text;
  var strToday = Utilities.formatDate(new Date(), "Asia/Tokyo", "MM/dd");
  //アンケートを送信
  if (input_text == "アンケちょーだい@出欠bot") {
    var postData = {
      "replyToken": e.replyToken,
      "messages": [
      {
        "type": "template",
        "altText": "attendance",
        "template": {
          "type": "buttons",
          "imageAspectRatio": "rectangle",
          "imageSize": "cover",
          "imageBackgroundColor": "#FFFFFF",
          "title": strToday + "の筋トレ出欠",
          "text": "下のボタンで回答してね\n(自動でメッセージが投稿されるよ)",
          "actions": [
          {
            "type": "message",
            "label": "行くよ！",
            "text": "行くよ！" + strToday + "@出欠bot"
          },
          {
            "type": "message",
            "label": "途中で抜けるよ！",
            "text": "途中で抜けるよ！" + strToday + "@出欠bot"
        },
        {
        "type": "message",
        "label": "途中から行くよ！",
        "text": "途中から行くよ！" + strToday + "@出欠bot"
        },
          {
            "type": "message",
            "label": "行けないよ…",
            "text": "行けないよ…" + strToday + "@出欠bot"
          }
          ]
        }
      }]
    };
  } else if (input_text == "行くよ！" + strToday + "@出欠bot"){ //アンケートのボタンを押した際の回答メッセージを処理
    updateRecords(e.source.userId, 0);
  } else if (input_text == "途中で抜けるよ！" + strToday + "@出欠bot"){
    updateRecords(e.source.userId, 1);
  } else if (input_text == "途中から行くよ！" + strToday + "@出欠bot"){
    updateRecords(e.source.userId, 2);
  } else if (input_text == "行けないよ…" + strToday + "@出欠bot"){
    updateRecords(e.source.userId, 3);
  } /*else if (input_text == "do_app_initialize"){ //グループのidをスプシに書き込み グループに参加した時に自動で処理できるようにしたかった
    recordGroupId(e.source.groupId);
    push_text("やあ！毎週火曜日の筋トレzoom会の出欠をとるbotだよ！\nまずはみんな友だち追加をよろしく！(LINEの仕様上、全員が追加してくれないと動かないんだ)\n火曜日の朝に出欠をとるボタンがついたメッセージを送るから、ボタンで回答してね");
  } */else if (input_text == "ホストできるよ@出欠bot"){ //ホストできる人として登録する
    recordAsHost(e.source.userId);
  } else if (input_text == "ホストできないよ@出欠bot"){　//ホストできる人から登録解除する
    recordNotAsHost(e.source.userId);
  }
  fetch_data(postData);
}

//グループのidを取得&記録
function recordGroupId(groupId){
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('group_id'); //sheetを取得
  sheet.getRange(1, 1, 1, 1).setValues([[groupId]]); //sheetに記載
}

//ホストできる人として登録
function recordAsHost(userId){
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('hosts');
  var lastRow=sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  for(var i=1;i<=lastRow;i++){
    if(sheet.getRange(i,1).getValue() == userId){
      push_text(getUserProfile(userId) +　"さんはすでに登録されているよ");
      return;
    }
  }
  sheet.appendRow([userId]);
  push_text(getUserProfile(userId) + "さんを登録したよ");
}

//ホストできる人から登録解除
function recordNotAsHost(userId){
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('hosts');
  var lastRow=sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  for(var i=1;i<=lastRow;i++){
    if(sheet.getRange(i,1).getValue() == userId){
      sheet.deleteRows(i); //対象の人のidの行を削除
      push_text(getUserProfile(userId) +　"さんの登録を解除したよ");
    }
  }
}

//引数で渡された文字列を送信する
function push_text(containts){ 
  var postData = {
      "to": SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('group_id').getRange(1, 1).getValue(), //送信先の取得
      "messages": [{
      "type": "text",
      "text": containts
    }]
  };
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData),
    "muteHttpExceptions": true
  };
  var response = UrlFetchApp.fetch(url, options);
}

function fetch_data(postData) {
  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    "payload": JSON.stringify(postData)
  };
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
}

//出欠確認のボタンの送信
function push_ask(){
  var strToday = Utilities.formatDate(new Date(), "Asia/Tokyo", "MM/dd"); //今日の日付の取得
    var postData = {
      "to": SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('group_id').getRange(1, 1).getValue(), //送信先の取得
      "messages": [{
        "type": "template",
        "altText": "attendance",
        "template": {
          "type": "buttons",
          "imageAspectRatio": "rectangle",
          "imageSize": "cover",
          "imageBackgroundColor": "#FFFFFF",
          "title": strToday + "の筋トレ出欠",
          "text": "下のボタンで回答してね\n(自動でメッセージが投稿されるよ)",
          "actions": [
          {
            "type": "message",
            "label": "行くよ！",
            "text": "行くよ！" + strToday + "@出欠bot"
          },
          {
            "type": "message",
            "label": "途中で抜けるよ！",
            "text": "途中で抜けるよ！" + strToday + "@出欠bot"
        },
        {
        "type": "message",
        "label": "途中から行くよ！",
        "text": "途中から行くよ！" + strToday + "@出欠bot"
        },
          {
            "type": "message",
            "label": "行けないよ…",
            "text": "行けないよ…" + strToday + "@出欠bot"
          }
          ]
        }
      }]
    };

  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  var response = UrlFetchApp.fetch(url, options);
  
}

//参加者の配列を返す
function getParticipants(){
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('attendance');
  var lastRow=sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  var participants = [[],[],[],[]];
  for(var i=1;i<=lastRow;i++){
    switch (sheet.getRange(i,2).getValue()){
      case 0: //「行けるよ！」
        participants[0].push(sheet.getRange(i,1).getValue());
        break;
      case 1: //「途中から行くよ！」
        participants[2].push(sheet.getRange(i,1).getValue());
        break;
      case 2: //「途中で抜けるよ！」
        participants[1].push(sheet.getRange(i,1).getValue());
        break;
      case 3: //「行けないよ…」
        participants[3].push(sheet.getRange(i,1).getValue());
        break;
    }
  }
  return participants;
}

//リマインドの送信
function push_host(){
  var strToday = Utilities.formatDate(new Date(), "Asia/Tokyo", "MM/dd"); //日付の取得
  var host = decideHost(); //ホストの決定
  var containts = "" //送信するテキスト
  
  if (host == "errorcode:0"){　//誰も参加できない時
    containts = "今日(" + strToday + ")は参加できる人がいないみたい！"
  } else { //誰かしら参加できる時
    containts = "このあと18時から始まるよ！\n今日(" + strToday + ")は" + getUserProfile(host) + "さん、zoomを立てるのヨロシクね！"
    var participants = getParticipants();
    var attendstr = ["最初から参加するのは ", "途中から参加するのは ", "途中で抜けるのは "]; 
    var participantsstr = "\n"; //出欠の一覧のテキスト
    for (var i=0; i<=2; i++){
      if (participants[i].length > 0){
        participantsstr += "\n" + attendstr[i];
        participants[i].forEach(function(person){
        participantsstr += getUserProfile(person) + "さん ";
        });
      }
      
    }
    containts += participantsstr;
    
  }
  
    var postData = {
      "to": SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('group_id').getRange(1, 1).getValue(), //送信先の取得
      "messages": [{
      "type": "text",
      "text": containts,
    }]
  };
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  var response = UrlFetchApp.fetch(url, options);
}

//出欠の書き込み
function updateRecords(userId, attendance){
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('attendance');
  var targetRow = 0;
  var lastRow=sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得

  for(var i=1;i<=lastRow;i++){
    if(sheet.getRange(i,1).getValue() == userId){
      targetRow = i;
    }
  }
  
  if (targetRow == 0){
    sheet.appendRow([userId, attendance]);
  } else {
  sheet.getRange(targetRow, 1, 1, 2).setValues([[userId, attendance]]);
  }
}

//出欠をすべて消去(アンケート送信前に実行されるようにトリガーを設定)
function clearRecords(){
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('attendance');
  sheet.clearContents();
}

//idから表示名に変換
function getUserProfile(userId){ 
    var url = 'https://api.line.me/v2/bot/profile/' + userId;
    var userProfile = UrlFetchApp.fetch(url,{
      'headers': {
        'Authorization' :  'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
    })
    return JSON.parse(userProfile).displayName;
}

//スプシの情報から誰がホストやるか決める
//抽選結果のidを返す 誰も参加できない場合は0を返す
function decideHost(){
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hostsSheet = spreadsheet.getSheetByName('hosts');
  const attendanceSheet = spreadsheet.getSheetByName('attendance');
  
  var hostsId = []; //ホストやってもいい人の配列を確保
  var lastRow=hostsSheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  for(var i=1;i<=lastRow;i++){
    hostsId.push(hostsSheet.getRange(i, 1).getValue());
  }
  
  
  var todayHost = [] //今日のホストの候補
  lastRow=attendanceSheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  //本来は
  //  ・ホスト可能で登録済み
  //  ・「行けるよ！」で回答した
  //の2つの条件を満たす人から抽選
  for(var i=1;i<=lastRow;i++){
    if ((attendanceSheet.getRange(i, 2).getValue() == 0 || attendanceSheet.getRange(i, 2).getValue() == 1) && (hostsId.indexOf(attendanceSheet.getRange(i, 1).getValue()) > -1)){
      todayHost.push(attendanceSheet.getRange(i, 1).getValue());
    }
  }
  //最初から参加できる人かつホストできる人がいない場合，参加可能な人から抽選
  if (todayHost.length == 0){
    for(var i=1;i<=lastRow;i++){
    　　if (attendanceSheet.getRange(i, 2).getValue() == 0 || attendanceSheet.getRange(i, 2).getValue() == 1){
      　　todayHost.push(attendanceSheet.getRange(i, 1).getValue());
    　　}
    }
  }
  //最初から参加できる人がいない場合，途中参加の人から抽選
  if (todayHost.length == 0){
    for(var i=1;i<=lastRow;i++){
    　　if (attendanceSheet.getRange(i, 2).getValue() == 2){
      　　todayHost.push(attendanceSheet.getRange(i, 1).getValue());
      }
    }
  }
  //誰も参加できない場合
  if (todayHost.length == 0){
    return "errorcode:0";
  }
  var r = Math.floor(Math.random() * (todayHost.length));
  return todayHost[r];
}
