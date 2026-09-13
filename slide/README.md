# SAKE LENS スライド

SAKE LENSの目的、使い方、仕組み、今後の拡張を約5分・6枚で紹介します。

## 起動

このディレクトリで実行します（Node.js 22以降を想定）。

```bash
npm install
npm run dev
```

http://localhost:3030 を開きます。

```bash
npm run build
```

静的ファイルはdistへ出力します。スライド本文はslides.mdを編集してください。

## PDF出力

Windowsにインストール済みのGoogle Chromeを使い、PDFを生成します。

```bash
npm run export:pdf
```

出力先は`dist/sake-lens.pdf`です。動画はPDFでは静止画として出力されます。
