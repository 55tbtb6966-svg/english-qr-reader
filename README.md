# English QR Reader IndexedDB 日本語読み改善版

## 日本語の自然さを改善する方法

CSVに `JapaneseRead` 列を追加しました。

- `Japanese`：画面に表示する日本語
- `JapaneseRead`：実際に読み上げる日本語。ひらがな、空白、句読点で調整します。

例：

ID,English,Japanese,JapaneseRead,Mode,EnglishRate,JapaneseRate,Repeat,Gap,Version
E000001,This is an apple.,これはリンゴです。,これは りんご です。,both,1.0,0.9,1,0.7,2026-08-01

`JapaneseRead` が空欄なら、`Japanese`をそのまま読み上げます。

アプリ内で利用可能な日本語音声も選択できます。


## 漢字列と読み列の表示

読み取り画面では次の両方を表示します。

- 表示用日本語（漢字）：`Japanese`
- 日本語読み：`JapaneseRead`

一括QRカードにも漢字と読みの両方を表示します。


## QRカードの表示内容

一括QR作成画面で、次の3種類から選択できます。

- 英語＋ひらがな
- 英語のみ
- ひらがなのみ

ひらがな表示には `JapaneseRead` を使用します。空欄の場合は `Japanese` を表示します。

## QR読み取り直後の音声改善

カメラ停止直後に約0.5秒待ってから再生し、iOS Safariで先頭音声が途切れにくいようにしました。
また、音声キャンセル直後にも短い待機を入れています。
