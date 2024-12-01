export class StyleUtils {
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