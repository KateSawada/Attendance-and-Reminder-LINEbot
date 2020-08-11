# 筋トレ会出欠LINEbot

毎週の筋トレ会の出欠を自動でとってくれるLINEのbotです．
gasを使うことでサーバーレスで手軽に作れてびっくりしました．


# 仕様

* botをグループに入れたら"do_app_initialize"を送信(このときだけ，ソースコードのelse if の部分のコメントアウトをはずしてください)
* ボタンを押す前にbotを友達追加することが必要 ※追加せずにボタンを押すと正しく動かない可能性アリ
* 指定した曜日の指定した時間に出欠のボタンが4つ付いたものを投稿する（行くよ！or途中で抜けるよ！or途中から行くよor行けないよ…）
* ↑のボタンを押すと、「出欠のメッセージ+日付」が自動で投稿される
* 5時〜6時の間にお知らせメッセージで、誰にzoom立ててもらうかのメッセージを投稿(ホストやってもいい人(※1)かつ「行くよ！」「途中で抜けるよ！」の人からランダムに選ぶ．条件に合う人がいなかったら，「行くよ！」「途中で抜けるよ！」の人から抽選)
* ↑誰も参加できない場合は，「今日は誰も参加できないみたい」と送信される
* 出欠は、アンケートの投稿からお知らせの間の最新のものが反映される
* zoomのホストできる人は，bot導入後に「ホストできるよ@出欠bot」と打つとホスト候補に登録される．解除は「ホストできないよ@出欠bot」でできる(デフォルトでは全員「できない」に設定)
* メッセージがどんどん流れて出欠ボタンをたどるのが面倒な時などは「アンケちょーだい@出欠bot」と打つとボタンをもう一度送信


# 使い方

1. スプレッドシートを作る(名前は何でもいいです)
2. スプレッドシートに"attendance", "hosts", "group_id" の名前のシートを作る
3. gasのファイルを作成してソースコードをコピペ
4. LINE Developersからプロバイダーを作る
5. LINEのMessage APIのアクセストークンをソースコードの1行目のところに貼り付け
6. スプレッドシートのid(https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXX/edit のXXXXXの部分)を同じく貼り付け
7. gasを保存して「公開」→「webアプリケーションとして導入」
* "version" を "New"
* "Execute as" を "Me"
* "Who has access to the app" を "Anyone, even anonymous" に設定してデプロイ
8. プロバイダーのチャンネルのMessaging API設定をいじる
* "Webhook URL" にデプロイ時に発行されたURL(末尾が/execで終わるやつ)をコピペ→更新→検証
* "Webhookの利用" をオンに
* "グループ・複数人チャットへの参加" を許可
* "応答メッセージ" を無効化
* "挨拶メッセージ" を無効化

あとはお好みでgasのトリガーの日時などを設定してください
