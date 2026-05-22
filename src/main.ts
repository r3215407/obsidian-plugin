import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
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
    console.log("loading plugin", Date.now());
    await this.loadSettings();
    this.addRibbonIcon("dice", "Sync Plugin", () => {
      this.fetchAndSaveArticle();
    });
    this.addStatusBarItem().setText("Status Bar Text");
    this.addCommand({
      id: "open-sample-modal",
      name: "Open Sample Modal",
      // callback: () => {
      // 	console.log('Simple Callback');
      // },
      checkCallback: (checking: boolean) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            new SampleModal(this.app).open();
          }
          return true;
        }
        return false;
      },
    });
    this.addSettingTab(new SampleSettingTab(this.app, this));
    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      console.log("codemirror", cm);
    });
    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      console.log("click", evt);
    });
    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
    );
  }

  onunload() {
    console.log("unloading plugin");
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

    const folderPath = "Inbox";
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const items = result.data || [];
    for (const item of items) {
      const title = item.title;
      const date = new Date().toISOString().slice(0, 10);
      const safeTitle = title.replace(/\s+|:\//g, "-");
      const fileName = `${folderPath}/${date} ${safeTitle}.md`;
      const markdown = item.markdown;

      const file = this.app.vault.getAbstractFileByPath(fileName);
      if (file) {
        await this.app.vault.modify(file as TFile, markdown);
      } else {
        await this.app.vault.create(fileName, markdown);
      }
      new Notice(`保存文章： ${fileName}`);
    }
    new Notice(`同步完成，总共同步了 ${result.data.length} 篇文章`);
  }
}


class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }
  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Woah!");
  }
  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
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
      .setName("API_KEY")
      .setDesc("通过微信公众号获取")
      .addText((text) =>
        text
          .setPlaceholder("输入 API_KEY")
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            console.log("API_KEY: " + value);
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
