import fs from 'fs';
import path from 'path';

export function renderConsent(vars: Record<string, string>): string {
  const templatePath = path.join(__dirname, '../views/consent.html');
  let html = fs.readFileSync(templatePath, 'utf-8');
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}
