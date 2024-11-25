# CalloutX: Callout Icons Explorer

CalloutX is an Obsidian plugin that allows you to view, manage, and customise callout icons in your vault. 

## Features

- Add new custom callouts with specified names, colors, and icons
- Edit existing callouts to change their names, colors, or icons
- Delete custom callouts you no longer need
- Preview all custom callout icons in a modal window
- Clipboard support for quick insertion of callout templates

## Usage

After installation, you can access the plugin functionality through:

### Command Palette (Ctrl/Cmd + P)

- Search for "Show Callout Icons" to open a modal displaying all custom callout icons
- Click on an icon to copy its template to your clipboard

### Plugin Settings Tab

- Access the CalloutX settings tab in Obsidian settings
- Here you can add, edit, delete, and search for callouts
- Use the color picker to easily select colors for your callouts
- The modal and settings tab will show the icon preview along with its name for each custom callout

## Custom Callouts CSS

The plugin reads and manages custom callout definitions in a file named `custom-callouts.css` in your snippets folder. If this file doesn't exist, the plugin will attempt to import it from the plugin folder.

CalloutX automatically generates and updates this CSS file based on your actions in the plugin settings, however, to define custom callouts manually you can use the following format in the `custom-callouts.css` file:

```css
.callout[data-callout="your-callout-name"] {
	--callout-color: 65, 201, 108;
	--callout-icon: icon-name;
}
```

Replace `your-callout-name` with the desired callout name and `icon-name` with the appropriate Lucide icon name.

## Compatibility

CalloutX is designed to work with desktop versions of Obsidian. It may not function correctly on mobile devices.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository for CalloutX.
