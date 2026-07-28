import { Plugin } from "obsidian";
interface SyncDataSettings {
    mySetting: string;
}
export default class SyncData extends Plugin {
    settings: SyncDataSettings;
    onload(): Promise<void>;
    onunload(): void;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    fetchAndSaveArticle(): Promise<void>;
    defuddleArticle(url: string): Promise<{
        title: string;
        markdown: string;
        author: string;
        tags: string;
    } | {
        title: string;
        markdown: string;
        author: string;
        tags?: undefined;
    }>;
    importUrls(urls: string[]): Promise<void>;
}
export {};
