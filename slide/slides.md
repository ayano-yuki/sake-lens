---
theme: seriph
title: SAKE LENS
fonts:
  sans: Noto Sans JP
  serif: Noto Serif JP
  mono: JetBrains Mono
drawings:
  persist: false
transition: slide-left
duration: 5min
layout: cover
mainTitle: SAKE LENS
subTitle: 日本酒の用語を、写真から理解する
image: /img/hackson.png
---

---
layout: default
title: 日本酒は身近にあるが、難しい
---

日本酒に興味はあるが、ラベル・説明の言葉が難しいと思ったことはありませんか？

- 酒屋で、瓶の前に立ったとき
- 広告やメニューに、知らない用語があったとき
- 飲む前に、造りや特徴を知りたいとき


<img
  src="https://www.catcafeblog.net/free/wp-content/uploads/2021/12/trouble-saba-q.png"
  alt="はてなマークの猫（https://www.catcafeblog.net/free/）"
  style="display: block; width: 300px; max-width: 100%; height: auto; margin: 0 auto;"
/>

---
layout: default
title: SAKE LENS
---

1. ラベルや広告の画像を選ぶ
2. 画像を解析し、用語の位置にボタンを表示
3. ボタンを押して、やさしい説明を読む
4. 気になることを、チャットで続けて聞く

<br>

<video
  src="/img/demo.mp4"
  aria-label="SAKE LENSの操作デモ"
  autoplay
  loop
  muted
  playsinline
  controls
  style="display: block; width: 500px; max-width: 100%; height: auto; margin: 0 auto;"
/>

---
layout: default
title: 写真が「わかる」に変わるまで
---

ブラウザ内OCRと用語辞典を照合してから、見つかった用語をDocker内のローカルLLMに送信することで、実現した。

<ProcessFlow
  :steps="[
    {
      label: '01 / 文字認識',
      title: '向きや背景を変えて3回読み取る',
      description: '元画像は横書き、反転・二値化画像は縦書きとして解析する。',
      technology: 'Canvas API / Tesseract.js',
    },
    {
      label: '02 / 用語検出',
      title: '文字と座標をつなぎ酒用語を選ぶ',
      description: '分割文字と別名を照合し、重なる候補では長い用語を優先する。',
      technology: '座標処理 / 用語リスト',
    },
    {
      label: '03 / 対話',
      title: '画像上のボタンから説明を開く',
      description: '初心者向けに説明し、会話履歴を使って追加質問にも答える。',
      technology: 'Ollama / Gemma 3 4B',
    },
  ]"
/>

---
layout: default
title: 現状の機能・今後の展望
---

**現状の機能**

- 画像の縦書き・横書きの日本語を位置付きで抽出
- 分割された文字の結合と、重複ボタンの抑制
- ローカルLLMによる説明と追加質問への回答

<br>

**今後の展望**

- 筆文字・小さい文字の認識改善、手動での修正
- 回答の逐次表示、会話履歴の保存
