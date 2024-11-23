# CalloutX: Callout Icons Explorer
CalloutX is an Obsidian plugin that allows you to view, manage, and customise callout icons in your vault. It provides an easy way to explore, visualise, and modify the callout icons defined in your custom CSS.


|                                                |                                                |
| :--------------------------------------------: | ---------------------------------------------- |
| ![screenshot](https://i.imgur.com/eB26W2A.png) | ![screenshot](https://i.imgur.com/XScvwMC.png) |


## Features

- Display a modal with all custom callout icons defined in your `custom-callouts.css` file
- Add new custom callouts with specified names, colors, and icons
- Edit existing callouts to change their names, colors, or icons
- Delete custom callouts you no longer need
- Search functionality to easily find specific callouts
- Automatically import the `custom-callouts.css` file from the plugin folder to your snippets folder if it doesn't exist
- Works on desktop versions of Obsidian

## Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click on Browse and search for "CalloutX"
4. Install the plugin and enable it

## Usage
After installation, you can access the plugin functionality through:

1. The command palette (Ctrl/Cmd + P)
    - Search for "Show Callout Icons" to open a modal displaying all custom callout icons
	
2. The plugin settings tab in Obsidian settings
    - Here you can add, edit, delete, and search for callouts
    

The modal and settings tab will show the icon preview along with its name for each custom callout defined in your CSS.

## Custom Callouts CSS
The plugin reads custom callout definitions from a file named `custom-callouts.css` in your snippets folder. If this file doesn't exist, the plugin will attempt to import it from the plugin folder.

To define custom callouts, use the following format in your CSS:

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
If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.
