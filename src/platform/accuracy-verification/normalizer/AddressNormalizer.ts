export class AddressNormalizer {
  public static normalize(address: string): string {
    if (!address) return '';
    
    let result = address.trim();

    // 1. Convert Full-width Alphanumeric & Numbers to Half-width
    result = result.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });

    // 2. Normalize spaces (Full-width space to empty/single space)
    result = result.replace(/[\u3000\s]+/g, '');

    // 3. Normalize hyphens and dashes (ー, ｰ, ‐, ‑, ‒, –, —, ―, ⁓, ⁻, ₋, −)
    result = result.replace(/[\u30fc\uff70\u2010\u2011\u2012\u2013\u2014\u2015\u2053\u207b\u208b\u2212]/g, '-');

    // 4. Normalize Parentheses & Special Annotations
    result = result.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');

    return result;
  }

  public static normalizeKana(kana: string): string {
    if (!kana) return '';
    let result = kana.trim().replace(/[\u3000\s]+/g, '');
    
    // Half-width kana to Full-width katakana
    const kanaMap: { [key: string]: string } = {
      'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
      'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
      'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
      'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
      'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
      'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
      'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
      'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
      'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
      'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
      'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
      'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン', 'ｰ': 'ー'
    };

    result = result.replace(/[ｧ-ﾝｰ]/g, (s) => kanaMap[s] || s);
    return result;
  }
}
