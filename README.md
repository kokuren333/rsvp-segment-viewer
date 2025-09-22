<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RSVP Segment Viewer

Rapid Serial Visual Presentation (RSVP) app that segments Japanese text locally with MeCab (WebAssembly) and plays it back chunk by chunk.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run the app: `npm run dev`

Upload a UTF-8 encoded `.txt` file to generate segments, or re-import a previously exported JSON (array of strings).

## Deploy to GitHub Pages

1. `npm install`
2. `npm run deploy`
3. GitHub リポジトリの Settings → Pages で Source を `gh-pages` ブランチに設定
4. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開確認

`npm run deploy` は `dist/` を `gh-pages` ブランチへ公開し、`404.html` も `index.html` と同内容で配置します。
