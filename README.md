# English QR Reader v2

## 追加機能

- iPhone上で英文データを追加・上書き・削除
- 編集後のデータを `words.csv` として書き出し
- QRコード作成
- 読み上げ速度 0.6 / 0.8 / 1.0 / 1.2 / 1.4
- ID・英文・日本語の検索

## GitHubへアップロード

`github_upload` フォルダ内の次の4ファイルを、リポジトリの最上位へアップロードします。

- index.html
- manifest.webmanifest
- sw.js
- README.md

## iCloud Driveへ保存

`icloud_drive/words.csv` をiCloud Driveへ保存します。

## QRコードの作り方

Webアプリの「QRコード作成」タブで、E001などのIDを入力して作成します。
作成されたQRコードはiPhoneで長押しして写真へ保存できます。

## CSV編集

「英文データ編集」タブでID・英文・日本語・速度・回数を入力し、
「追加／上書き」を押します。

編集後は「CSVを書き出す」を押して `words.csv` を保存してください。
SafariのWebサイトデータを削除すると端末内データも消えるため、CSVを書き出してバックアップしてください。
