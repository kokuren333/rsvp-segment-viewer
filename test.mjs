import MecabModule from 'file:///C:/Users/mtmoi/Desktop/CGs/rsvp/node_modules/mecab-wasm/lib/mecab.js';
(async () => {
  await MecabModule.waitReady();
  const results = MecabModule.query('�����͗ǂ��V�C�ł��B\n�����������ł��傤�B');
  console.log(results);
})();
