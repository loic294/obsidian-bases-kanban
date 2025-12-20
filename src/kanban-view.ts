import {
	BasesView,
	BasesPropertyId,
	BasesEntry,
	QueryController,
	ViewOption,
	Value,
} from 'obsidian';
import type BasesKanbanPlugin from './main';

interface KanbanConfig {
	columnProp: BasesPropertyId | null;
	titleProp: BasesPropertyId | null;
	descriptionProp: BasesPropertyId | null;
}

export const KanbanViewType = 'kanban';

export class KanbanView extends BasesView {
	type = KanbanViewType;
	scrollEl: HTMLElement;
	containerEl: HTMLElement;
	plugin: BasesKanbanPlugin;

	private kanbanConfig: KanbanConfig | null = null;

	constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BasesKanbanPlugin) {
		super(controller);
		this.scrollEl = scrollEl;
		this.plugin = plugin;
		this.containerEl = scrollEl.createDiv({ cls: 'bases-kanban-container' });
	}

	onload(): void {
		// Setup listeners if needed
	}

	onunload(): void {
		// Cleanup
	}

	public focus(): void {
		this.containerEl.focus({ preventScroll: true });
	}

	public onDataUpdated(): void {
		this.kanbanConfig = this.loadConfig();
		this.render();
	}

	private loadConfig(): KanbanConfig {
		return {
			columnProp: this.config.getAsPropertyId('columnProperty'),
			titleProp: this.config.getAsPropertyId('titleProperty'),
			descriptionProp: this.config.getAsPropertyId('descriptionProperty'),
		};
	}

	private render(): void {
		this.containerEl.empty();

		if (!this.kanbanConfig?.columnProp) {
			this.containerEl.createEl('p', {
				text: 'Select a property for columns in the view options.',
				cls: 'bases-kanban-placeholder'
			});
			return;
		}

		// Get entries from BasesQueryResult
		const entries = this.data?.data ?? [];

		// Group entries by column property value
		const columns = new Map<string, BasesEntry[]>();

		for (const entry of entries) {
			const columnValue = this.getValueAsString(entry.getValue(this.kanbanConfig.columnProp));
			const columnKey = columnValue ?? '(No value)';
			
			if (!columns.has(columnKey)) {
				columns.set(columnKey, []);
			}
			columns.get(columnKey)!.push(entry);
		}

		// Render columns
		const boardEl = this.containerEl.createDiv({ cls: 'bases-kanban-board' });

		for (const [columnName, items] of columns) {
			const columnEl = boardEl.createDiv({ cls: 'bases-kanban-column' });
			
			// Column header
			const headerEl = columnEl.createDiv({ cls: 'bases-kanban-column-header' });
			headerEl.createEl('h3', { text: columnName });
			headerEl.createEl('span', { 
				text: `${items.length}`,
				cls: 'bases-kanban-column-count'
			});

			// Cards container
			const cardsEl = columnEl.createDiv({ cls: 'bases-kanban-cards' });

			for (const entry of items) {
				this.renderCard(cardsEl, entry);
			}
		}
	}

	private renderCard(container: HTMLElement, entry: BasesEntry): void {
		const cardEl = container.createDiv({ cls: 'bases-kanban-card' });

		// Get title from configured property or fall back to file name
		let title: string | null = null;
		if (this.kanbanConfig?.titleProp) {
			title = this.getValueAsString(entry.getValue(this.kanbanConfig.titleProp));
		}
		if (!title) {
			title = entry.file.basename;
		}

		// Card title
		const titleEl = cardEl.createDiv({ cls: 'bases-kanban-card-title' });
		const filePath = entry.file.path;
		
		const link = titleEl.createEl('a', { 
			text: title,
			cls: 'internal-link'
		});
		link.addEventListener('click', (evt) => {
			evt.preventDefault();
			void this.app.workspace.openLinkText(filePath, '', evt.ctrlKey || evt.metaKey);
		});

		// Description (if configured)
		if (this.kanbanConfig?.descriptionProp) {
			const description = this.getValueAsString(entry.getValue(this.kanbanConfig.descriptionProp));
			if (description) {
				cardEl.createDiv({ 
					text: description,
					cls: 'bases-kanban-card-description'
				});
			}
		}
	}

	private getValueAsString(value: Value | null): string | null {
		if (value === null || value === undefined) return null;
		
		// Value has a toString() method
		const str = value.toString();
		return str || null;
	}

	static getViewOptions(): ViewOption[] {
		return [
			{
				displayName: 'Column property',
				type: 'property',
				key: 'columnProperty',
				filter: prop => !prop.startsWith('file.'),
				placeholder: 'Select property for columns',
			},
			{
				displayName: 'Card title',
				type: 'property',
				key: 'titleProperty',
				placeholder: 'Property (defaults to file name)',
			},
			{
				displayName: 'Card description',
				type: 'property',
				key: 'descriptionProperty',
				filter: prop => !prop.startsWith('file.'),
				placeholder: 'Property (optional)',
			},
		];
	}
}
