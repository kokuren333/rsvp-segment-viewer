declare module 'mecab-wasm/lib/mecab.js' {
  export interface MecabToken {
    word: string;
    pos: string;
    pos_detail1: string;
    pos_detail2: string;
    pos_detail3: string;
    conjugation1: string;
    conjugation2: string;
    dictionary_form: string;
    reading: string;
    pronunciation: string;
  }

  export interface MecabModule {
    waitReady(): Promise<void>;
    query(text: string): MecabToken[];
  }

  const mecab: MecabModule;
  export default mecab;
}
