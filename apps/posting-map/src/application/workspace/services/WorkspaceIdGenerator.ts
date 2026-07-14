export class WorkspaceIdGenerator {
  private static readonly prefectureMap: Record<string, string> = {
    '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi',
    '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima', '茨城県': 'ibaraki',
    '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba',
    '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata', '富山県': 'toyama',
    '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano',
    '岐阜県': 'gifu', '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie',
    '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
    '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane',
    '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima',
    '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka',
    '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto', '大分県': 'oita',
    '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa'
  };

  private static readonly kanjiNumMap: Record<string, string> = {
    '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
    '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'
  };

  public static generate(workspaceName: string): string {
    // Find prefecture name in workspaceName
    let prefix = '';
    for (const [jpName, enName] of Object.entries(this.prefectureMap)) {
      if (workspaceName.includes(jpName) || workspaceName.includes(jpName.replace(/[県府都]$/, ''))) {
        prefix = enName;
        break;
      }
    }

    // Extract number
    let num = '';
    const numMatch = workspaceName.match(/[0-9０-９]+/);
    if (numMatch) {
      // Convert full-width digits to half-width digits
      num = numMatch[0].replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    } else {
      for (const [k, v] of Object.entries(this.kanjiNumMap)) {
        if (workspaceName.includes(k)) {
          num = v;
          break;
        }
      }
    }

    if (prefix && num) {
      const paddedNum = num.padStart(2, '0');
      return `${prefix}-${paddedNum}`;
    }

    // Fallback if no matching pattern: create unique ID
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `workspace-${timestamp}-${random}`;
  }
}
