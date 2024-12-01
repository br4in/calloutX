import { Setting, Modal } from 'obsidian';

export class EditCalloutModal extends Modal {
    constructor(app, plugin, callout, styleUtils) {
        super(app);
        this.plugin = plugin;
        this.callout = callout;
        this.styleUtils = styleUtils;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Edit callout'});

        new Setting(contentEl)
            .setName('Callout name')
            .addText(text => text
                .setValue(this.callout.name)
                .onChange(value => this.callout.name = value));

        new Setting(contentEl)
            .setName('Callout color')
            .addText(text => {
                text.inputEl.type = 'color';
                const hexColor = '#' + this.callout.color.split(', ').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
                text.setValue(hexColor)
                    .onChange(value => {
                        this.callout.color = value.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ');
                    });
            });

        new Setting(contentEl)
            .setName('Callout icon')
            .addText(text => text
                .setValue(this.callout.icon)
                .onChange(value => this.callout.icon = value));

        new Setting(contentEl)
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