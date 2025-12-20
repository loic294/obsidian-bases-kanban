import {
	BasesView,
	BasesPropertyId,
	QueryController,
	ViewOption,
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

		// Group data by column property value
		const columns = new Map<string, typeof this.data>();

		if (this.data) {
			for (const row of this.data) {
				const columnValue = this.getPropertyValue(row, this.kanbanConfig.columnProp);
				const columnKey = columnValue ?? '(No value)';
				
				if (!columns.has(columnKey)) {
					columns.set(columnKey, []);
				}
				columns.get(columnKey)!.push(row);
			}
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

			for (const item of items) {
				this.renderCard(cardsEl, item);
			}
		}
	}

	private renderCard(container: HTMLElement, row: Record<string, unknown>): void {
		const cardEl = container.createDiv({ cls: 'bases-kanban-card' });

		// Get title
		const title = this.kanbanConfig?.titleProp 
			? this.getPropertyValue(row, this.kanbanConfig.titleProp)
			: this.getPropertyValue(row, 'file.name');

		// Card title
		const titleEl = cardEl.createDiv({ cls: 'bases-kanban-card-title' });
		const filePath = this.getPropertyValue(row, 'file.path');
		
		if (filePath) {
			const link = titleEl.createEl('a', { 
				text: title ?? 'Untitled',
				cls: 'internal-link'
			});
			link.addEventListener('click', (evt) => {
				evt.preventDefault();
				void this.app.workspace.openLinkText(filePath, '', evt.ctrlKey || evt.metaKey);
			});
		} else {
			titleEl.setText(title ?? 'Untitled');
		}

		// Description (if configured)
		if (this.kanbanConfig?.descriptionProp) {
			const description = this.getPropertyValue(row, this.kanbanConfig.descriptionProp);
			if (description) {
				cardEl.createDiv({ 
					text: description,
					cls: 'bases-kanban-card-description'
				});
			}
		}
	}

	private getPropertyValue(row: Record<string, unknown>, propId: string): string | null {
		const value = row[propId];
		if (value === null || value === undefined) return null;
		if (typeof value === 'string') return value;
		if (typeof value === 'number') return String(value);
		if (Array.isArray(value)) return value.join(', ');
		return String(value);
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

