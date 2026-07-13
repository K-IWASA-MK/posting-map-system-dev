import { SpreadsheetReader } from '../../../infrastructure/spreadsheet/SpreadsheetReader';
import { EmailTemplateDto } from './EmailTemplateDto';

export class EmailTemplateService {
  private reader: SpreadsheetReader;
  private sheetName = 'メールテンプレート';

  constructor() {
    this.reader = new SpreadsheetReader();
  }

  public async getActiveTemplates(): Promise<EmailTemplateDto[]> {
    try {
      const rows = this.reader.readAll(this.sheetName);
      if (!rows || rows.length <= 1) return this.getDefaultTemplates();

      const headers = rows[0];
      const idIdx = headers.indexOf('templateId');
      const nameIdx = headers.indexOf('templateName');
      const subjectIdx = headers.indexOf('subject');
      const bodyIdx = headers.indexOf('body');
      const enabledIdx = headers.indexOf('enabled');

      if (idIdx === -1) return this.getDefaultTemplates();

      const templates: EmailTemplateDto[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[idIdx] || String(row[idIdx]).trim().length === 0) continue;
        
        const enabled = enabledIdx !== -1 
          ? String(row[enabledIdx]).trim().toLowerCase() === 'true' 
          : true;
        
        if (!enabled) continue;

        templates.push({
          templateId: String(row[idIdx]).trim(),
          templateName: nameIdx !== -1 ? String(row[nameIdx]).trim() : '',
          subject: subjectIdx !== -1 ? String(row[subjectIdx]).trim() : '',
          body: bodyIdx !== -1 ? String(row[bodyIdx]) : '',
          enabled
        });
      }

      if (templates.length === 0) {
        return this.getDefaultTemplates();
      }
      return templates;
    } catch (e) {
      // Fallback to default templates if the sheet does not exist or read fails
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): EmailTemplateDto[] {
    return [
      {
        templateId: 'MAIL001',
        templateName: '参加案内メール',
        subject: 'ポスティング活動に参加のお願い',
        body: `党員さん、サポーターさんへ

ポスティング活動へのご協力のお願いです。

{{workspaceName}}では、
地域で協力してポスティング活動を進めるため、
POSTING MAPを導入しました。

また、チラシを保管してご協力いただける方は、
{{workspaceName}}までご連絡ください。

POSTING MAPでは、

「どこで」
「誰が」
「何枚持っているか」

を支部内で共有し、
協力しながらポスティング活動を進めることができます。

以下のLINE URLから登録をお願いします。

▼POSTING MAP参加入口

{{lineAppUrl}}

登録後、POSTING MAPを利用して
ポスティング活動に参加できます。

皆さんで協力して、
地域で継続できるポスティング活動を作っていきましょう。

{{workspaceName}}`,
        enabled: true
      },
      {
        templateId: 'MAIL002',
        templateName: 'チラシ保有協力お願いメール',
        subject: 'チラシ保有ご協力のお願い',
        body: `党員さん、サポーターさんへ

チラシの保有についてのご協力のお願いです。

{{workspaceName}}では、
ポスティング活動で使用するチラシを保有して
ご協力いただける方を募集しています。

ご協力いただける方は、{{workspaceName}}までご連絡いただくか、以下のLINE URLから登録を行ってください。

▼POSTING MAP登録入口

{{lineAppUrl}}

登録後、市町村ごとのチラシ保有状況を支部内で共有し、効率的にポスティング活動を進めることができます。

どうぞよろしくお願いいたします。

{{workspaceName}}`,
        enabled: true
      }
    ];
  }
}
