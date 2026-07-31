# English QR Reader（iCloud Drive CSV版）

## GitHubへアップロードするもの

`github_upload` フォルダ内の4ファイルを、GitHubリポジトリの最上位へアップロードします。

- index.html
- manifest.webmanifest
- sw.js
- README.md

ZIPファイルや `github_upload` フォルダ自体ではなく、中の4ファイルをアップロードしてください。

## iCloud Driveへ保存するもの

`icloud_drive` フォルダ内の `words.csv` を、iPhoneの「ファイル」アプリからiCloud Driveへ保存します。

例：

iCloud Drive / English QR Reader / words.csv

## iPhoneでの使い方

1. GitHub PagesのURLをSafariで開く
2. 「ファイルを選択」を押す
3. iCloud Driveの `words.csv` を選ぶ
4. 「CSVを読み込む」を押す
5. 「QRコードを読み取る」を押す
6. カメラ使用を許可する
7. E001などのQRコードを読み取る

## CSVの列

ID,English,Japanese,Rate,Repeat

QRコードにはIDだけを入れます。

例：E001

## 古い画面が表示される場合

1. Safariでページを再読み込み
2. それでも直らなければ、iPhoneの設定からSafariのWebサイトデータを削除
3. GitHub PagesのURLを再度開く
4. CSVを再登録する

注意：Webサイトデータを削除すると、Safari内に保存したCSVデータも消えるため再登録が必要です。
