# English QR Reader IndexedDB版

## 保存方式
CSVは配布・バックアップ用です。
読み込んだデータは各iPhoneのSafari内のIndexedDBへ1件ずつ保存されます。

## 読み方
Mode列に次のいずれかを指定します。

- english：英語のみ
- japanese：日本語のみ
- both：英語を読んだ後に日本語

## CSV列
ID,English,Japanese,Mode,EnglishRate,JapaneseRate,Repeat,Gap,Version

例：
E000001,This is an apple.,これはリンゴです。,both,1.0,1.0,1,0.5,2026-08-01

## 更新方法
- 全置換：古いIndexedDBデータを消してCSV内容に統一
- 追加・上書き：新規IDを追加し、同じIDだけ更新

複数人への正式配布では全置換がおすすめです。

## GitHubへアップロード
github_uploadフォルダ内の4ファイルをリポジトリ最上位へアップロードします。

## iCloud Drive
icloud_drive内のwords.csvを配布・バックアップ用として保存します。
