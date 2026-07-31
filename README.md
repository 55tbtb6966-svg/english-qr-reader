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
