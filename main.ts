import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface RandomNoteSettings {
	destinationFolder: string;
	cutOffTime: string;
}

const DEFAULT_SETTINGS: RandomNoteSettings = {
	destinationFolder: "",
	cutOffTime: "",
};

export default class RandomNotePlugin extends Plugin {
	settings: RandomNoteSettings;

	async onload() {
		await this.loadSettings();

		// creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon("dice", "Sample Plugin", () => {
			// gets all files from the obsidian vault
			const files = this.app.vault.getMarkdownFiles();

			// gets all files containing path set
			const FolderFiles = files.filter((word) =>
				word.path.includes(this.settings.destinationFolder)
			);

			// gets files that has a later time stamp then set in days
			const unixTime = Number(this.settings.cutOffTime) * 24 * 60 * 60;
			const ts = Math.floor(Date.now() / 1000);
			const timeFiles = FolderFiles.filter(
				(file) => ts - unixTime > file.stat.ctime / 1000
			);

			// picks a random note
			const fileOpen =
				timeFiles[Math.floor(Math.random() * FolderFiles.length)];

			// opens the file
			this.app.workspace.openLinkText(fileOpen.basename, "");

			// indicating success
			new Notice("Random note generated");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RandomNoteSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RandomNoteSettingTab extends PluginSettingTab {
	plugin: RandomNotePlugin;

	constructor(app: App, plugin: RandomNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// setting for folder path
		new Setting(containerEl)
			.setName("Destination folder path")
			.setDesc(
				"Set a folder path, all notes selected will be within that folder"
			)
			.addText((text) =>
				text
					.setPlaceholder("Project/Errands")
					.setValue(this.plugin.settings.destinationFolder)
					.onChange(async (value) => {
						this.plugin.settings.destinationFolder = value;
						await this.plugin.saveSettings();
					})
			);

		// setting for time stamp
		new Setting(containerEl)
			.setName("Cutoff time")
			.setDesc(
				"Specify a time x (days), all notes selected will be x days prior to today (if applicable)"
			)
			.addText((text) =>
				text
					.setPlaceholder("7")
					.setValue(this.plugin.settings.cutOffTime)
					.onChange(async (value) => {
						if (typeof Number(value) == "number") {
							this.plugin.settings.cutOffTime = value;
						}
						await this.plugin.saveSettings();
					})
			);
	}
}
