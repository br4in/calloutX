import { Setting, Modal } from 'obsidian';

export class AddCalloutModal extends Modal {
    constructor(app, plugin, styleUtils) {
        super(app);
        this.plugin = plugin;
        this.styleUtils = styleUtils;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: 'Add new callout'});

        new Setting(contentEl)
            .setName('Callout name')
            .addText(text => this.nameInput = text);

        new Setting(contentEl)
            .setName('Callout color')
            .addText(text => {
                this.colorInput = text;
                this.colorInput.inputEl.type = 'color';
                this.colorInput.inputEl.value = '#34AB34';
            });

        new Setting(contentEl)
            .setName('Callout icon')
            .addText(text => this.iconInput = text);

        contentEl.createEl('a', {
            text: 'Browse Lucide.dev icons',
            href: 'https://lucide.dev/'
        });

        new Setting(contentEl)
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