var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/main.ts
__markAsModule(exports);
__export(exports, {
  default: () => main_default
});
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  mySetting: "default"
};
var SyncData = class extends import_obsidian.Plugin {
  async onload() {
    console.log("loading plugin", Date.now());
    await this.loadSettings();
    this.addRibbonIcon("dice", "Sample Plugin", () => {
      new import_obsidian.Notice("This is a notice!");
    });
    this.addStatusBarItem().setText("Status Bar Text");
    this.fetchAndSaveArticle();
    this.addCommand({
      id: "open-sample-modal",
      name: "Open Sample Modal",
      checkCallback: (checking) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            new SampleModal(this.app).open();
          }
          return true;
        }
        return false;
      }
    });
    this.addSettingTab(new SampleSettingTab(this.app, this));
    this.registerCodeMirror((cm) => {
      console.log("codemirror", cm);
    });
    this.registerDomEvent(document, "click", (evt) => {
      console.log("click", evt);
    });
    this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
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
    const url = "http://localhost:3000/api/sync"
    try {
      const resp = await fetch(url);
      const result = await resp.json();
      const title = result['title'];
      const date = new Date().toISOString().slice(0, 10);
      const safeTitle = title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-]/g, "");
      const fileName = `${date}-${safeTitle}.md`;
      const markdown = result['markdown']
      await this.app.vault.create(fileName, markdown);
      new import_obsidian.Notice(`Saved article to ${fileName}`);
    } catch (e) {
      console.error("Failed to fetch article", e);
    }
  }
};
var main_default = SyncData;
var SampleModal = class extends import_obsidian.Modal {
  constructor(app) {
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
};
var SampleSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    let { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for my awesome plugin." });
    new import_obsidian.Setting(containerEl).setName("Setting #1").setDesc("It's a secret").addText((text) => text.setPlaceholder("Enter your secret").setValue("").onChange(async (value) => {
      console.log("Secret: " + value);
      this.plugin.settings.mySetting = value;
      await this.plugin.saveSettings();
    }));
  }
};
