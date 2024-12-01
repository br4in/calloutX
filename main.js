'use strict';

var obsidian = require('obsidian');

class EditCalloutModal extends obsidian.Modal {
    constructor(app, plugin, callout, styleUtils) {
        super(app);
        this.plugin = plugin;
        this.callout = callout;
        this.styleUtils = styleUtils;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Edit callout'});

        new obsidian.Setting(contentEl)
            .setName('Callout name')
            .addText(text => text
                .setValue(this.callout.name)
                .onChange(value => this.callout.name = value));

        new obsidian.Setting(contentEl)
            .setName('Callout color')
            .addText(text => {
                text.inputEl.type = 'color';
                const hexColor = '#' + this.callout.color.split(', ').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
                text.setValue(hexColor)
                    .onChange(value => {
                        this.callout.color = value.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ');
                    });
            });

        new obsidian.Setting(contentEl)
            .setName('Callout icon')
            .addText(text => text
                .setValue(this.callout.icon)
                .onChange(value => this.callout.icon = value));

        new obsidian.Setting(contentEl)
            .addButton(button => button
                .setButtonText('Save')
                .onClick(() => {
                    this.plugin.saveCallouts();
                    this.styleUtils.reloadIconStyles();
                    this.close();
                    if (this.plugin.settingsTab) { this.plugin.settingsTab.display(); }
                }));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class AddCalloutModal extends obsidian.Modal {
    constructor(app, plugin, styleUtils) {
        super(app);
        this.plugin = plugin;
        this.styleUtils = styleUtils;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Add new callout'});

        new obsidian.Setting(contentEl)
            .setName('Callout name')
            .addText(text => this.nameInput = text);

        new obsidian.Setting(contentEl)
            .setName('Callout color')
            .addText(text => {
                this.colorInput = text;
                this.colorInput.inputEl.type = 'color';
                this.colorInput.inputEl.value = '#34AB34';
            });

        new obsidian.Setting(contentEl)
            .setName('Callout icon')
            .addText(text => this.iconInput = text);

        contentEl.createEl('a', {
            text: 'Browse Lucide.dev icons',
            href: 'https://lucide.dev/'
        });

        new obsidian.Setting(contentEl)
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    const colorValue = this.colorInput.getValue().slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ');
                    this.plugin.callouts.push({
                        name: this.nameInput.getValue(),
                        color: colorValue,
                        icon: this.iconInput.getValue()
                    });

                    await this.plugin.saveCallouts();
                    this.styleUtils.reloadIconStyles(this.plugin.callouts);
                    this.close();
                    if (this.plugin.settingsTab) { this.plugin.settingsTab.display(); }
                }));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class CalloutIconsSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin, styleUtils) {
        super(app, plugin);
        this.plugin = plugin;
        this.styleUtils = styleUtils;
    }

    display() {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass('callout-icons-settings');

        const searchInput = containerEl.createEl('input', {
            type: 'text',
            placeholder: 'Search callouts...',
            cls: 'search-input'
        });
        searchInput.addEventListener('input', () => {
            this.displayFilteredCallouts(searchInput.value);
        });

        new obsidian.Setting(containerEl)
            .setName('Add new callout')
            .setDesc('Add a new custom callout')
            .addButton(button => button
                .setButtonText('Add callout')
                .onClick(() => {
                    new AddCalloutModal(this.app, this.plugin, this.styleUtils).open();
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
            obsidian.setIcon(iconEl, callout.icon);
            // Ensure the latest custom color
            iconEl.querySelector('svg').style.color = `rgb(${callout.color})`;

            calloutEl.createEl('span', {
                text: `${callout.name} (${callout.icon})`});


            const editButton = calloutEl.createEl('button', {text: 'Edit'});
            editButton.onclick = () => {
                new EditCalloutModal(this.app, this.plugin, callout, this.styleUtils).open();
            };

            const deleteButton = calloutEl.createEl('button', {text: 'Delete'});
            deleteButton.onclick = () => {
                this.plugin.callouts = this.plugin.callouts.filter(c => c.name !== callout.name);
                this.plugin.saveCallouts(this.plugin.callouts);
                this.styleUtils.reloadIconStyles(this.plugin.callouts);
                this.displayCalloutList();
            };
        });
    }
}

class CalloutIconsModal extends obsidian.Modal {
    constructor(app, callouts) {
        super(app);
        this.callouts = callouts;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.empty();
        contentEl.createEl('h2', {text: 'Custom callout icons'});

        const searchInput = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'Search callouts...',
            cls: 'search-input'
        });
        searchInput.addEventListener('input', () => {
            this.displayFilteredCallouts(searchInput.value);
        });

        this.iconList = contentEl.createEl('div', {cls: 'callout-icon-list-modal'});
        this.app.dom.appContainerEl.addClass('blur-background');

        this.displayCallouts(this.callouts);
    }

    displayFilteredCallouts(searchTerm) {
        const filteredCallouts = this.callouts.filter(callout =>
            callout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            callout.icon.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayCallouts(filteredCallouts);
    }

    displayCallouts(callouts) {
        this.iconList.empty();
        callouts.forEach(callout => {
            const iconContainer = this.iconList.createEl('div', {
                cls: 'callout-icon-container-modal'
            });
            const iconEl = iconContainer.createEl('div', { cls: `callout-icon-preview callout-icon-${callout.name}` });
            obsidian.setIcon(iconEl, callout.icon);
            iconContainer.createEl('div', {
                text: callout.name,
                attr: {'style': 'font-size: 13px;'}
            });
            iconEl.addEventListener('click', () => {
                const template = this.createCalloutTemplate(callout.name);
                navigator.clipboard.writeText(template);
                new obsidian.Notice('Template copied to clipboard.');
                this.close();
            });
        });
    }

    createCalloutTemplate(icon) {
        return `> [!${icon}] Title
> Contents`;
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
        this.app.dom.appContainerEl.removeClass('blur-background');
    }
}

class CalloutUtils {
  constructor(app, callouts) {
    this.app = app;
    this.callouts = [];
  }

  async loadCallouts() {
    let cssPath;
    if (this.app.vault.adapter instanceof obsidian.FileSystemAdapter) {
      cssPath = `${this.app.vault.configDir}/snippets/custom-callouts.css`;
    } else {
      new obsidian.Notice('CalloutX only works on Desktop');
      return;
    }

    try {
      const cssContent = await this.app.vault.adapter.read(cssPath);
      const regex = /\.callout\[data-callout="([\w-]+)"\]\s*{[^}]*--callout-color:\s*(\d+,\s*\d+,\s*\d+)[^}]*--callout-icon:\s*([\w-]+)[^}]*}/g;
      let match;
      while ((match = regex.exec(cssContent)) !== null) {
        this.callouts.push({
          name: match[1],
          color: match[2],
          icon: match[3]
        });
      }
      return this.callouts;
    } catch (error) {
      new obsidian.Notice('custom-callouts.css not found in the snippets folder, importing it...');
      await this.importCustomCalloutsFile();
    }
  }

  async saveCallouts(callouts) {
    if (this.app.vault.adapter instanceof obsidian.FileSystemAdapter) {
      const cssPath = `${this.app.vault.configDir}/snippets/custom-callouts.css`;
      let cssContent = '';
      callouts.forEach(callout => {
        cssContent += `.callout[data-callout="${callout.name}"] {
          --callout-color: ${callout.color};
          --callout-icon: ${callout.icon};
        }\n\n`;
      });
      cssContent += `.callout.is-collapsible .callout-title { cursor: pointer; }`;

      try {
        await this.app.vault.adapter.write(cssPath, cssContent);
        new obsidian.Notice('Custom callouts saved successfully');
      } catch (error) {
        console.error('Error saving custom callouts:', error);
        new obsidian.Notice('Error saving custom callouts');
      }
    } else {
      new obsidian.Notice('CalloutX only works on Desktop');
    }
  }

  async importCustomCalloutsFile() {
    if (this.app.vault.adapter instanceof obsidian.FileSystemAdapter) {
      const pluginPath = `${this.app.vault.configDir}/plugins/calloutX`;
      const snippetsPath = `${this.app.vault.configDir}/snippets`;
      const sourceFile = `${pluginPath}/custom-callouts.css`;
      const destFile = `${snippetsPath}/custom-callouts.css`;

      try {
        const sourceContent = await this.app.vault.adapter.read(sourceFile);
        await this.app.vault.adapter.write(destFile, sourceContent);
        new obsidian.Notice('custom-callouts.css imported successfully to snippets folder');
        await this.loadCallouts();
      } catch (error) {
        if (error.message.includes('ENOENT')) {
          console.log('custom-callouts.css not found in plugin folder');
        } else {
          console.error('Error moving custom-callouts.css:', error);
        }
      }
    } else {
      new obsidian.Notice('CalloutX only works on Desktop');
    }
  }
}

class StyleUtils {
    constructor (callouts) {
        this.callouts = callouts;
    }

    loadIconStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'callout-icons-styles';
        document.head.appendChild(styleEl);

        styleEl.textContent = `
            ${this.callouts.map(callout => `
            .callout-icon-${callout.name} svg {
                color: rgb(${callout.color});
            }
            `).join('')}
        `;
    }

    reloadIconStyles(callouts = this.callouts) {
        const styleEl = document.getElementById('callout-icons-styles');
        if (styleEl) {
            styleEl.textContent = `
                ${callouts.map(callout => `
                .callout-icon-${callout.name} svg {
                    color: rgb(${callout.color});
                }
                `).join('')}
            `;
        }
    }

}

class CalloutXPlugin extends obsidian.Plugin {
    callouts = [];
    settingsTab;

    addStyle(cssString) {
        const styleElement = document.createElement('style');
        styleElement.id = 'calloutx-style';
        styleElement.textContent = cssString;
        document.head.appendChild(styleElement);
    }

    async onload() {
        this.calloutUtils = new CalloutUtils(this.app);
        this.callouts = await this.calloutUtils.loadCallouts();

        // Load CSS
        const styleCssPath = this.manifest.dir + '/style.css';
        try {
            const styleCss = await this.app.vault.adapter.read(styleCssPath);
            if (styleCss) this.addStyle(styleCss);
        } catch (error) {
            console.error('Error loading CSS files:', error);
        }

        // Load dynamic css
        this.styleUtils = new StyleUtils(this.callouts);
        this.styleUtils.loadIconStyles();

        this.settingsTab = new CalloutIconsSettingTab(this.app, this, this.styleUtils);
        this.addSettingTab(this.settingsTab);

        this.addCommand({
            id: 'show-callout-icons',
            name: 'Show callout icons',
            callback: () => {
                new CalloutIconsModal(this.app, this.callouts).open();
            }
        });
    }

    async saveCallouts(callouts = this.callouts) {
        await this.calloutUtils.saveCallouts(callouts);
    }

    async importCustomCalloutsFile() {
        await this.calloutUtils.importCustomCalloutsFile();
    }

    async onunload() {
        // Remove added stylesheets
        document.querySelector('#calloutx-style').remove();
        document.querySelector('#callout-icons-styles').remove();
    }
}

module.exports = CalloutXPlugin;
