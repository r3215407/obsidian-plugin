# Sync WeChat Data (同步微信数据)

[English](#english) | [简体中文](#简体中文)

---

<a name="english"></a>
## English

**Sync WeChat Data** is an Obsidian plugin designed to seamlessly synchronize articles and markdown data fetched via a WeChat official account API directly into your Obsidian vault. Keep your reading lists, saved articles, and clipped content organized, updated, and fully searchable offline inside Obsidian.

### ✨ Features

- **🚀 Multiple Sync Triggers**:
  - **Ribbon Icon**: Click the dedicated bird icon in the ribbon for instant synchronization.
  - **Command Palette**: Run the `Sync Wechat Data` command anytime.
  - **Automatic Sync**: Runs automatically in the background every hour to keep your vault up to date.
- **📁 Smart File Management**:
  - Automatically creates a dedicated `同步数据` (Synced Data) folder in your vault.
  - Formats filenames elegantly using the synchronization date and safe titles: `YYYY-MM-DD Title.md`.
  - Cleans up illegal characters from titles (like spaces and special symbols) to guarantee safe and cross-platform file saving.
- **🔄 Incremental Updates**:
  - Overwrites existing files if they have been updated on the server.
  - Creates new files for newly synchronized articles.
  - Real-time status notifications for the entire sync process.

---

### ⚙️ How to Setup

1. **Get your API Key**: Obtain your synchronization API key (API key through your configured WeChat Official Account service).
2. **Configure the Plugin**:
   - Go to Obsidian Settings -> **Sync WeChat Data**.
   - Input your key into the **API key** field.
3. **Start Syncing**:
   - Click the bird icon on the left ribbon, or
   - Press `Ctrl/Cmd + P`, search for `Sync Wechat Data`, and hit Enter.

---

### 🛠️ Development & Installation

#### Manual Installation

If you want to install this plugin manually before it is officially released on the community store:

1. Download the latest release (`main.js`, `manifest.json`).
2. Create a folder named `sync-wechat-data` inside your vault's plugin directory: `<vault>/.obsidian/plugins/sync-wechat-data`.
3. Copy the files into that folder.
4. Reload plugins in Obsidian and enable **Sync WeChat Data**.

#### Build from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/sync-wechat-data.git
   cd sync-wechat-data
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development build (with file watching):
   ```bash
   npm run dev
   ```

---

<a name="简体中文"></a>
## 简体中文

**Sync WeChat Data** 是一款 Obsidian 插件，旨在将通过微信公众号接口获取的微信文章及 Markdown 数据无缝同步到您的 Obsidian 库中。让您的阅读列表、保存的文章和剪辑的内容在 Obsidian 内实现离线整理、自动更新和全文检索。

### ✨ 功能特点

- **🚀 多种同步触发方式**:
  - **侧边栏图标**: 点击左侧侧边栏特有的“小鸟”图标即可立即开始同步。
  - **命令面板**: 随时运行 `Sync Wechat Data` 命令。
  - **自动同步**: 在后台每小时自动运行一次，确保您的笔记库随时保持最新状态。
- **📁 智能文件管理**:
  - 自动在您的笔记库中创建专属的 `同步数据` 文件夹。
  - 文件命名格式优雅规范：`YYYY-MM-DD 文章标题.md`。
  - 自动清理标题中的非法字符（如空格和特殊符号），确保跨平台文件保存的绝对安全。
- **🔄 增量更新**:
  - 如果服务器上的文章有更新，会自动覆盖本地文件。
  - 对于新同步的文章，会自动创建新文件。
  - 同步全过程提供实时的 Notice 通知气泡提示。

---

### ⚙️ 配置与使用步骤

1. **获取 API Key**: 通过您配置好的微信公众号服务获取专属的 API Key。
2. **配置插件**:
   - 进入 Obsidian 设置 -> **Sync WeChat Data**。
   - 在 **API key** 输入框中填写您的密钥。
3. **开始同步**:
   - 点击左侧侧边栏的“小鸟”图标，或者
   - 按下 `Ctrl/Cmd + P` 键，搜索 `Sync Wechat Data` 并回车。

---

### 🛠️ 开发与安装

#### 手动安装

在插件通过官方社区应用商店审核发布前，您可以通过以下方式手动安装：

1. 下载最新发布的 `main.js` 和 `manifest.json` 文件。
2. 在您的 Obsidian 库的插件目录下创建名为 `sync-wechat-data` 的文件夹：`<vault>/.obsidian/plugins/sync-wechat-data`。
3. 将下载的文件复制到该文件夹中。
4. 在 Obsidian 中重新加载插件并启用 **Sync WeChat Data**。

#### 源码编译开发

1. 克隆本仓库：
   ```bash
   git clone https://github.com/your-username/sync-wechat-data.git
   cd sync-wechat-data
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行开发编译（支持热重载监听）：
   ```bash
   npm run dev
   ```

---

### 📄 License

This project is licensed under the [MIT License](LICENSE).
本项目基于 [MIT 许可证](LICENSE) 开源。
