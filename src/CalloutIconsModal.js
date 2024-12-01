import { Modal, setIcon, Notice } from 'obsidian';

export class CalloutIconsModal extends Modal {
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
            setIcon(iconEl, callout.icon);
            iconContainer.createEl('div', {
                text: callout.name,
                attr: {'style': 'font-size: 13px;'}
            });
            iconEl.addEventListener('click', () => {
                const template = this.createCalloutTemplate(callout.name);
                navigator.clipboard.writeText(template);
                new Notice('Template copied to clipboard.');
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