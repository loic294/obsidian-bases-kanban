import { App, PluginSettingTab, Setting } from 'obsidian';
import BasesKanbanPlugin from './main';

export interface KanbanSettings {
	// Plugin-level settings can be added here
}

export const DEFAULT_SETTINGS: KanbanSettings = {
};

export class KanbanSettingTab extends PluginSettingTab {
	plugin: BasesKanbanPlugin;

	constructor(app: App, plugin: BasesKanbanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Settings will be added here as needed
		containerEl.createEl('p', {
			text: 'Kanban view settings will appear here.',
			cls: 'setting-item-description'
		});
	}
}
