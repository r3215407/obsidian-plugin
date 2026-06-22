import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  normalizePath,
  requestUrl,
  TFile,
  htmlToMarkdown,
} from "obsidian";
import Defuddle, { DefuddleOptions } from 'defuddle';

interface SyncDataSettings {
  mySetting: string;
}
const DEFAULT_SETTINGS: SyncDataSettings = {
  mySetting: "default",
};

interface SyncArticleItem {
  title: string;
  markdown: string;
}
interface SyncApiResponse {
  data?: SyncArticleItem[];
}

export default class SyncData extends Plugin {
  settings: SyncDataSettings;
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("bird", "Sync Wechat Plugin", () => {
      void this.fetchAndSaveArticle();
    });
    this.addCommand({
      id: "sync",
      name: "Sync Wechat",
      callback: () => {
        void this.fetchAndSaveArticle();
      },
    });
    this.addCommand({
      id: "import-urls",
      name: "快速导入数据",
      callback: () => {
        new ImportUrlsModal(this.app, (urls) => {
          void this.importUrls(urls);
        }).open();
      },
    });
    this.addSettingTab(new SettingTab(this.app, this));
    this.registerInterval(
      window.setInterval(() => { void this.fetchAndSaveArticle(); }, 60 * 60 * 1000)
    );
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as SyncDataSettings;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async fetchAndSaveArticle() {
    if (!this.settings.mySetting || this.settings.mySetting == 'default') {
      return;
    }
    new Notice(`开始同步...`);
    const url = `https://md.arabcariana.com/api/sync?code=${this.settings.mySetting}`;
    const resp = await requestUrl({ url });
    const result = resp.json as SyncApiResponse;

    const folderPath = normalizePath("同步数据");
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const items = result.data ?? [];
    for (const item of items) {
      const title = item.title;
      const safeTitle = title.replace(/\s+|:\//g, "-");
      const fileName = normalizePath(`${folderPath}/${safeTitle}.md`);
      const markdown = item.markdown;

      const file = this.app.vault.getAbstractFileByPath(fileName);
      if (file instanceof TFile) {
        await this.app.vault.modify(file, markdown);
      } else {
        await this.app.vault.create(fileName, markdown);
      }
      new Notice(`保存文章： ${fileName}`);
    }
    new Notice(`同步完成，总共同步了 ${items.length} 篇文章`);
  }

  async defuddleArticle(url: string) {
    const response = await requestUrl({
      url, headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
      }
    });
    const html = response.text;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const options: DefuddleOptions = { url };

    if (url.includes('xhslink')) {
      const images = Array.from(doc.querySelectorAll('meta[name="og:image"]')).map(item => `![](${item.getAttribute('content')})`).join('\n');
      const desc = Array.from(doc.querySelectorAll('body span')).map(item => item.textContent || '').join('\n');
      const final_desc = desc.split('\n关注\n关注\n').pop();
      // assable  split result but ignore the last one
      const tags = final_desc?.split('#').slice(0, -1).join(' #');

      return {
        title: doc.querySelector('meta[name="og:title"]')?.getAttribute('content')?.replace(' - 小红书', '') || '',
        markdown: images + (tags ? '\n\n' + tags : ''),
        author: doc.querySelector('span[class="username"]')?.textContent || '',
        tags: tags
      };
    }

    if (url.includes('weixin')) {
      options.contentSelector = '#js_content';
    }

    const result = new Defuddle(doc, options).parse();
    const markdown = htmlToMarkdown(result.content || '');

    return {
      title: result.title || '',
      markdown,
      author: result.author || ''
    };
  }

  async importUrls(urls: string[]) {
    new Notice(`准备导入 ${urls.length} 条 URL`);

    const folderPath = normalizePath("同步数据");
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    for (const url of urls) {
      if (!url.includes('http')) {
        continue
      }
      const item = await this.defuddleArticle(url);
      const title = (item.title || '').trim().replace(/[\\/:]/g, '') || 'Untitled';
      const author = (item.author || '').trim();

      const fileName = normalizePath(`${folderPath}/${title}.md`);

      const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
source: "${url}"
author: "${author.replace(/"/g, '\\"')}"
created: ${new Date().toISOString().split('T')[0]}
tags:
  - "clippings"
---
`;

      const markdown = (item.markdown || '').replace(/(\n\n)(\s*\n\n)+/g, '\n\n');

      const file = this.app.vault.getAbstractFileByPath(fileName);
      if (file instanceof TFile) {
        await this.app.vault.modify(file, frontmatter + markdown);
      } else {
        await this.app.vault.create(fileName, frontmatter + markdown);
      }

      new Notice(`保存文章： ${fileName}`);
    }
    new Notice(`同步完成，总共同步了 ${urls.length} 篇文章`);
  }
}


class SettingTab extends PluginSettingTab {
  plugin: SyncData;
  constructor(app: App, plugin: SyncData) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName("设置你的插件").setHeading();
    new Setting(containerEl)
      .setName("API key")
      .setDesc("通过微信公众号获取")
      .addText((text) =>
        text
          .setPlaceholder("输入 API key")
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

class ImportUrlsModal extends Modal {
  private onSubmit: (urls: string[]) => void;
  private textarea: HTMLTextAreaElement;

  constructor(app: App, onSubmit: (urls: string[]) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    const modalEl = this.containerEl.querySelector<HTMLElement>(".modal");
    modalEl?.addClass("sync-data-import-modal");
    if (modalEl) {
      modalEl.setCssStyles({
        width: "760px",
        maxWidth: "88vw",
        paddingTop: "18px",
        height: "",
        minHeight: "",
      });
    }
    contentEl.setCssStyles({
      width: "100%",
      paddingTop: "0",
      boxSizing: "border-box",
    });
    const titleEl = contentEl.createEl("h2", { text: "导入数据" });
    titleEl.setCssStyles({
      marginTop: "0",
      marginBottom: "24px",
      paddingTop: "0",
    });
    const descEl = contentEl.createEl("p", {
      text: "每行输入一个 URL，点击确认后开始导入。",
      cls: "setting-item-description",
    });
    descEl.setCssStyles({ marginBottom: "18px" });
    contentEl.addClass("sync-data-import-content");

    this.textarea = contentEl.createEl("textarea", {
      placeholder: "https://example.com/article1\nhttps://example.com/article2",
      cls: "sync-data-import-textarea",
    });
    this.textarea.rows = 4;
    this.textarea.cols = 30;
    this.textarea.setCssStyles({
      display: "block",
      width: "70%",
      minWidth: "100%",
      height: "200px",
      minHeight: "200px",
      boxSizing: "border-box",
    });

    const btnRow = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = btnRow.createEl("button", { text: "取消" });
    cancelBtn.addEventListener("click", () => this.close());

    const confirmBtn = btnRow.createEl("button", {
      text: "确认",
      cls: "mod-cta",
    });
    confirmBtn.addEventListener("click", () => {
      const raw = this.textarea.value;
      const urls = raw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (urls.length === 0) {
        new Notice("请至少输入一个 URL");
        return;
      }
      this.close();
      this.onSubmit(urls);
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
