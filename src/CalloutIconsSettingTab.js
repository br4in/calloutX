import { PluginSettingTab, Setting, setIcon } from 'obsidian';
import { EditCalloutModal } from './EditCalloutModal';
import { AddCalloutModal } from './AddCalloutModal';

export class CalloutIconsSettingTab extends PluginSettingTab {
    constructor(app, plugin, styleUtils) {
        super(app, plugin);
        this.plugin = plugin;
        this.styleUtils = styleUtils
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

        new Setting(containerEl)
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
            setIcon(iconEl, callout.icon);
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