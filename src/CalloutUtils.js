import { FileSystemAdapter, Notice } from 'obsidian';

export class CalloutUtils {
  constructor(app, callouts) {
    this.app = app;
    this.callouts = [];
  }

  async loadCallouts() {
    let cssPath;
    if (this.app.vault.adapter instanceof FileSystemAdapter) {
      cssPath = `${this.app.vault.configDir}/snippets/custom-callouts.css`;
    } else {
      new Notice('CalloutX only works on Desktop');
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
      new Notice('custom-callouts.css not found in the snippets folder, importing it...');
      await this.importCustomCalloutsFile();
    }
  }

  async saveCallouts(callouts) {
    if (this.app.vault.adapter instanceof FileSystemAdapter) {
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
        new Notice('Custom callouts saved successfully');
      } catch (error) {
        console.error('Error saving custom callouts:', error);
        new Notice('Error saving custom callouts');
      }
    } else {
      new Notice('CalloutX only works on Desktop');
    }
  }

  async importCustomCalloutsFile() {
    if (this.app.vault.adapter instanceof FileSystemAdapter) {
      const pluginPath = `${this.app.vault.configDir}/plugins/calloutX`;
      const snippetsPath = `${this.app.vault.configDir}/snippets`;
      const sourceFile = `${pluginPath}/custom-callouts.css`;
      const destFile = `${snippetsPath}/custom-callouts.css`;

      try {
        const sourceContent = await this.app.vault.adapter.read(sourceFile);
        await this.app.vault.adapter.write(destFile, sourceContent);
        new Notice('custom-callouts.css imported successfully to snippets folder');
        await this.loadCallouts();
      } catch (error) {
        if (error.message.includes('ENOENT')) {
          console.log('custom-callouts.css not found in plugin folder');
        } else {
          console.error('Error moving custom-callouts.css:', error);
        }
      }
    } else {
      new Notice('CalloutX only works on Desktop');
    }
  }
}