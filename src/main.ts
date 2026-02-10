import { Plugin } from 'obsidian';
import { KanbanView } from './kanban-view';
import { KanbanSettings, DEFAULT_SETTINGS, KanbanSettingTab } from './settings';

export interface TagColor {
	tag_name: string;
	color: { r: number; g: number; b: number };
	background_color: { r: number; g: number; b: number };
	luminance_offset?: number;
}

export interface TagColorsConfig {
	TagColors?: {
		ColorPicker?: TagColor[];
	};
}

export default class BasesKanbanPlugin extends Plugin {
	settings: KanbanSettings;
	tagColors: Map<string, TagColor> = new Map();

	async onload() {
		await this.loadSettings();
		await this.loadTagColors();

		this.registerBasesView('kanban', {
			name: 'Kanban',
			icon: 'lucide-kanban',
			factory: (controller, containerEl) => new KanbanView(controller, containerEl, this),
			options: () => KanbanView.getViewOptions(),
		});

		this.addSettingTab(new KanbanSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadTagColors() {
		try {
			const colorPluginPath = '.obsidian/plugins/colored-tags-wrangler/data.json';
			const colorData = await this.app.vault.adapter.read(colorPluginPath);
			const config: TagColorsConfig = JSON.parse(colorData);
			
			if (config.TagColors?.ColorPicker) {
				this.tagColors.clear();
				for (const tagColor of config.TagColors.ColorPicker) {
					this.tagColors.set(tagColor.tag_name.toLowerCase(), tagColor);
				}
			}
		} catch (error) {
			console.log('Could not load tag colors from colored-tags-wrangler plugin:', error);
		}
	}

	getTagColor(tagName: string): TagColor | undefined {
		// Remove # if present and convert to lowercase
		const cleanTag = tagName.replace(/^#/, '').toLowerCase();
		return this.tagColors.get(cleanTag);
	}

	onunload() {
	}
}
