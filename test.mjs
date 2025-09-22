import MecabModule from 'file:///C:/Users/mtmoi/Desktop/CGs/rsvp/node_modules/mecab-wasm/lib/mecab.js';
(async () => {
  await MecabModule.waitReady();
  const results = MecabModule.query('今日は良い天気です。\n明日も晴れるでしょう。');
  console.log(results);
})();
