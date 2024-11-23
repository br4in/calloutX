const { Plugin, PluginSettingTab, Setting, Modal, FileSystemAdapter, Notice, setIcon } = require('obsidian');
const path = require('path');
const fs = require('fs').promises;

class CalloutXPlugin extends Plugin {
    callouts = [];
    settingsTab;

    async onload() {
        await this.loadCallouts();
        this.settingsTab = new CalloutIconsSettingTab(this.app, this);
        this.addSettingTab(this.settingsTab);
        this.loadStyles();
        this.loadIconStyles();


        this.addCommand({
            id: 'show-callout-icons',
            name: 'Show Callout Icons',
            callback: () => {
                new CalloutIconsModal(this.app, this.callouts).open();
            }
        });
    }

    async loadCallouts() {
        let basePath, cssPath, cssFile;

        if (this.app.vault.adapter instanceof FileSystemAdapter) {
            basePath = this.app.vault.adapter.getBasePath();
            cssPath = path.join(this.app.vault.configDir, 'snippets', 'custom-callouts.css');
            cssFile = `${basePath}/${cssPath}`;
        } else {
            Notice('CalloutX only works on Desktop');
        }

        try {
            const cssContent = await fs.readFile(cssFile, 'utf8');
            const regex = /\.callout\[data-callout="([\w-]+)"\]\s*{[^}]*--callout-color:\s*(\d+,\s*\d+,\s*\d+)[^}]*--callout-icon:\s*([\w-]+)[^}]*}/g;
            let match;

            while ((match = regex.exec(cssContent)) !== null) {
                this.callouts.push({
                    name: match[1],
                    color: match[2],
                    icon: match[3]
                });
            }
        } catch (error) {
            console.log('custom-callouts.css not found in the snippets folder, importing it...');
            this.importCustomCalloutsFile();
        }
    }

    async saveCallouts() {
        if (this.app.vault.adapter instanceof FileSystemAdapter) {
            const basePath = this.app.vault.adapter.getBasePath();
            const cssPath = path.join(this.app.vault.configDir, 'snippets', 'custom-callouts.css');
            const cssFile = `${basePath}/${cssPath}`;

            let cssContent = '';
            this.callouts.forEach(callout => {
                cssContent += `.callout[data-callout="${callout.name}"] {
    --callout-color: ${callout.color};
    --callout-icon: ${callout.icon};
}\n\n`;
            });

            cssContent += `.callout.is-collapsible .callout-title { cursor: pointer; }`

            try {
                await fs.writeFile(cssFile, cssContent, 'utf8');
                new Notice('Custom callouts saved successfully');
            } catch (error) {
                console.error('Error saving custom callouts:', error);
                new Notice('Error saving custom callouts');
            }
        }
    }

    async importCustomCalloutsFile() {
        if (this.app.vault.adapter instanceof FileSystemAdapter) {
            const basePath = this.app.vault.adapter.getBasePath();
            const pluginPath = path.join(basePath, '.obsidian', 'plugins', 'calloutX');
            const snippetsPath = path.join(basePath, '.obsidian', 'snippets');
            const sourceFile = path.join(pluginPath, 'custom-callouts.css');
            const destFile = path.join(snippetsPath, 'custom-callouts.css');

            try {
                await fs.access(sourceFile);
                await fs.mkdir(snippetsPath, { recursive: true });
                await fs.copyFile(sourceFile, destFile);
                console.log('custom-callouts.css imported successfully to snippets folder');
                this.loadCallouts();
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log('custom-callouts.css not found in plugin folder');
                } else {
                    console.error('Error moving custom-callouts.css:', error);
                }
            }
        } else {
            new Notice('CalloutX only works on Desktop');
        }
    }

    loadStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'callout-icons-styles';
        document.head.appendChild(styleEl);

        styleEl.textContent = `
            .callout-icon-list {
                display: flex;
                justify-content: center;
            }
            .callout-icon-container {
                margin: 10px;
                text-align: center;
                display: inline-block;
            }
            .callout-icon-preview {
                font-size: 32px;
                width: 32px;
                height: 32px;
                margin: 5px auto;
            }
            .callout-icon-preview svg {
                font-size: 32px;
            }

            .callout-icons-settings {
                padding: 16px;
            }
            .callout-icons-settings h2 {
                margin-bottom: 16px;
            }
            .callout-list {
                margin-top: 20px;
            }
            .callout-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-bottom: 1px solid var(--background-modifier-border);
            }
            .callout-item:last-child {
                border-bottom: none;
            }
            .callout-item span {
                flex-grow: 1;
            }
            .callout-item button {
                margin-left: 8px;
            }
            .search-input {
                width: 100%;
                margin-bottom: 16px;
            }
            .add-callout-button {
                margin-top: 16px;
            }

            ${this.callouts.map(callout => `
            .callout-icon-${callout.name} svg {
                color: rgb(${callout.color});
            }
            `).join('')}

            .callout-icon-list-modal {
                display: flex;
                flex-wrap: wrap;
                justify-content: left;
            }
            .callout-icon-container-modal {
                margin: 10px;
                text-align: center;
            }

            .blur-background {
                filter: blur(5px);
                transition: filter 0.3s ease;
            }
        `;
    }

    loadIconStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'callout-icons-dynamic-styles';
        document.head.appendChild(styleEl);
    }

    updateIconColor(calloutName, color) {
        const styleEl = document.getElementById('callout-icons-dynamic-styles');
        if (styleEl) {
            const existingRuleIndex = Array.from(styleEl.sheet.cssRules).findIndex(
                rule => rule.selectorText === `.callout-icon-${calloutName} svg`
            );

            const rule = `.callout-icon-${calloutName} svg { color: rgb(${color}); }`;

            if (existingRuleIndex !== -1) {
                styleEl.sheet.deleteRule(existingRuleIndex);
                styleEl.sheet.insertRule(rule, existingRuleIndex);
            } else {
                styleEl.sheet.insertRule(rule, styleEl.sheet.cssRules.length);
            }
        }
    }

}

class CalloutIconsSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass('callout-icons-settings');

        containerEl.createEl('h2', {text: 'Callout Icons Settings'});

        const searchInput = containerEl.createEl('input', {
            type: 'text',
            placeholder: 'Search callouts...',
            cls: 'search-input'
        });
        searchInput.addEventListener('input', () => {
            this.displayFilteredCallouts(searchInput.value);
        });

        new Setting(containerEl)
            .setName('Add New Callout')
            .setDesc('Add a new custom callout')
            .addButton(button => button
                .setButtonText('Add Callout')
                .onClick(() => {
                    new AddCalloutModal(this.app, this.plugin).open();
                }));

        this.calloutListEl = containerEl.createEl('div', {cls: 'callout-list'});
        this.displayCalloutList();
    }

    displayFilteredCallouts(searchTerm) {
        const filteredCallouts = this.plugin.callouts.filter(callout => 
            callout.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            callout.icon.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayCalloutList(filteredCallouts);
    }

    displayCalloutList(callouts = this.plugin.callouts) {
        this.calloutListEl.empty();

        callouts.forEach(callout => {
            const calloutEl = this.calloutListEl.createEl('div', {cls: 'callout-item'});
            const iconEl = calloutEl.createEl('div', { cls: `callout-icon-preview callout-icon-${callout.name}` });
            setIcon(iconEl, callout.icon);

            calloutEl.createEl('span', {
                text: `${callout.name} (${callout.icon})`});


            const editButton = calloutEl.createEl('button', {text: 'Edit'});
            editButton.onclick = () => {
                new EditCalloutModal(this.app, this.plugin, callout).open();
            };

            const deleteButton = calloutEl.createEl('button', {text: 'Delete'});
            deleteButton.onclick = () => {
                this.plugin.callouts = this.plugin.callouts.filter(c => c.name !== callout.name);
                this.plugin.saveCallouts();
                this.displayCalloutList();
            };
        });
    }
}

class AddCalloutModal extends Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Add New Callout'});

        new Setting(contentEl)
            .setName('Callout Name')
            .addText(text => this.nameInput = text);

        new Setting(contentEl)
            .setName('Callout Color')
            .addText(text => {
                this.colorInput = text;
                this.colorInput.inputEl.type = 'color';
                this.colorInput.inputEl.value = '#000000';
            });

        new Setting(contentEl)
            .setName('Callout Icon')
            .addText(text => this.iconInput = text);

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText('Add')
                .onClick(() => {
                    const colorValue = this.colorInput.getValue().slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ');
                    this.plugin.callouts.push({
                        name: this.nameInput.getValue(),
                        color: colorValue,
                        icon: this.iconInput.getValue()
                    });
                    this.plugin.saveCallouts();
                    this.close();
                    this.plugin.updateIconColor(this.callout.name, this.callout.color);
                    if (this.plugin.settingsTab) { this.plugin.settingsTab.display(); }
                }));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class EditCalloutModal extends Modal {
    constructor(app, plugin, callout) {
        super(app);
        this.plugin = plugin;
        this.callout = callout;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Edit Callout'});

        new Setting(contentEl)
            .setName('Callout Name')
            .addText(text => text
                .setValue(this.callout.name)
                .onChange(value => this.callout.name = value));

        new Setting(contentEl)
            .setName('Callout Color')
            .addText(text => {
                text.inputEl.type = 'color';
                const hexColor = '#' + this.callout.color.split(', ').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
                text.setValue(hexColor)
                    .onChange(value => {
                        this.callout.color = value.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ');
                    });
            });

        new Setting(contentEl)
            .setName('Callout Icon')
            .addText(text => text
                .setValue(this.callout.icon)
                .onChange(value => this.callout.icon = value));

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText('Save')
                .onClick(() => {
                    this.plugin.saveCallouts();
                    this.close();
                    this.plugin.updateIconColor(this.callout.name, this.callout.color);
                    if (this.plugin.settingsTab) { this.plugin.settingsTab.display(); }
                }));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}


class CalloutIconsModal extends Modal {
    constructor(app, callouts) {
        super(app);
        this.callouts = callouts;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.empty();
        contentEl.createEl('h2', {text: 'Custom Callout Icons'});

        const iconList = contentEl.createEl('div', {cls: 'callout-icon-list-modal'});

        this.app.dom.appContainerEl.addClass('blur-background');

        this.callouts.forEach(callout => {
            const iconContainer = iconList.createEl('div', {
                cls: 'callout-icon-container-modal'
            });

            const iconEl = iconContainer.createEl('div', { cls: `callout-icon-preview callout-icon-${callout.name}` });
            setIcon(iconEl, callout.icon);

            iconContainer.createEl('div', {
                text: callout.name,
                attr: {'style': 'font-size: 13px;'}
            });
        });
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
        this.app.dom.appContainerEl.removeClass('blur-background');
    }
}

module.exports = CalloutXPlugin;