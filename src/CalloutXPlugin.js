import { Plugin } from 'obsidian';
import { CalloutIconsSettingTab } from './CalloutIconsSettingTab';
import { CalloutIconsModal } from './CalloutIconsModal';
import { CalloutUtils } from './CalloutUtils';
import { StyleUtils } from './StyleUtils';

export class CalloutXPlugin extends Plugin {
    callouts = [];
    settingsTab;

    addStyle(cssString) {
        const styleElement = document.createElement('style');
        styleElement.id = 'calloutx-style'
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