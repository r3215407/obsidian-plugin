import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  normalizePath,
  TFile,
} from "obsidian";
interface SyncDataSettings {
  mySetting: string;
}
const DEFAULT_SETTINGS: SyncDataSettings = {
  mySetting: "default",
};

export default class SyncData extends Plugin {
  settings: SyncDataSettings;
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("bird", "Sync Wechat Plugin", () => {
      this.fetchAndSaveArticle();
    });
    this.addCommand({
      id: "sync-wechat-data",
      name: "Sync Wechat Data",
      callback: () => {
        this.fetchAndSaveArticle();
      },
    });
    this.addSettingTab(new SettingTab(this.app, this));
    this.registerInterval(
      window.setInterval(() => this.fetchAndSaveArticle(), 60 * 60 * 1000)
    );
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async fetchAndSaveArticle() {
    new Notice(`开始同步`);
    const url = `https://md.arabcariana.com/api/sync?code=${this.settings.mySetting}`;
    const resp = await fetch(url);
    const result = await resp.json();

    const folderPath = normalizePath("同步数据");
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const items = result.data || [];
    for (const item of items) {
      const title = item.title;
      const date = new Date().toISOString().slice(0, 10);
      const safeTitle = title.replace(/\s+|:\//g, "-");
      const fileName = normalizePath(`${folderPath}/${date} ${safeTitle}.md`);
      const markdown = item.markdown;

      const file = this.app.vault.getAbstractFileByPath(fileName);
      if (file) {
        await this.app.vault.modify(file as TFile, markdown);
      } else {
        await this.app.vault.create(fileName, markdown);
      }
      new Notice(`保存文章： ${fileName}`);
    }
    new Notice(`同步完成，总共同步了 ${items.length} 篇文章`);
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
    containerEl.createEl("h2", { text: "设置你的插件" });
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
