# Bases Kanban

Requires [Obsidian 1.10](https://obsidian.md/changelog/2025-11-11-desktop-v1.10.3/). This project adds a kanban layout to Obsidian Bases.

## Kanban view for Obsidian Bases

Adds a kanban layout to [Obsidian Bases](https://help.obsidian.md/bases) so you can display notes as cards organized in columns.

- Display notes as cards grouped by a property value
- Configure which property defines the columns (e.g., status, priority)
- Customize card title and description properties
- Click cards to open the corresponding note

## Installation

### For development

1. Clone this repository into your vault's `.obsidian/plugins/` folder
2. Run `npm install`
3. Run `npm run dev` to start development mode
4. Enable the plugin in Obsidian Settings → Community plugins

### Building

```bash
npm run build
```

## Usage

1. Create a Base in Obsidian
2. Switch to Kanban view from the view switcher
3. Configure the column property in view options
4. Notes will be grouped by the values of that property

## License

MIT
