// RegEx Tester Pro - Enhanced JavaScript Implementation
class RegexTesterPro {
    constructor() {
        this.regexEditor = null;
        this.testEditor = null;
        this.currentMatches = [];
        this.currentGroups = [];
        this.patterns = {};
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';

        this.init();
    }

    init() {
        this.loadPatterns();
        this.setupEditors();
        this.setupEventListeners();
        this.setupTheme();
        this.setupKeyboardShortcuts();

        // Load sample data on first visit
        if (!localStorage.getItem('hasVisited')) {
            this.loadSampleData();
            localStorage.setItem('hasVisited', 'true');
        }
    }

    loadPatterns() {
        this.patterns = {
            common: [
                {
                    title: "Email Address",
                    regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
                    description: "Matches most email addresses"
                },
                {
                    title: "URL/Website",
                    regex: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
                    description: "Matches HTTP and HTTPS URLs"
                },
                {
                    title: "Phone Number (US)",
                    regex: "(\\+1\\s?)?\\(?([0-9]{3})\\)?[\\s.-]?([0-9]{3})[\\s.-]?([0-9]{4})",
                    description: "Matches US phone numbers in various formats"
                },
                {
                    title: "IP Address",
                    regex: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b",
                    description: "Matches IPv4 addresses"
                },
                {
                    title: "Date (MM/DD/YYYY)",
                    regex: "(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d",
                    description: "Matches dates in MM/DD/YYYY format"
                }
            ],
            validation: [
                {
                    title: "Strong Password",
                    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                    description: "At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char"
                },
                {
                    title: "Credit Card Number",
                    regex: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$",
                    description: "Matches Visa, MasterCard, American Express, Discover"
                },
                {
                    title: "Social Security Number",
                    regex: "^(?!666|000|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}$",
                    description: "Validates US SSN format (XXX-XX-XXXX)"
                },
                {
                    title: "ZIP Code",
                    regex: "^\\d{5}(-\\d{4})?$",
                    description: "Matches US ZIP codes (5 or 9 digits)"
                }
            ],
            parsing: [
                {
                    title: "HTML Tags",
                    regex: "<\\/?([a-z][a-z0-9]*)\\b[^>]*>",
                    description: "Matches HTML opening and closing tags"
                },
                {
                    title: "CSS Hex Colors",
                    regex: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b",
                    description: "Matches hex color codes (#RGB or #RRGGBB)"
                },
                {
                    title: "JSON String Values",
                    regex: "\"([^\"\\\\]|\\\\.)*\"",
                    description: "Matches JSON string values with escape sequences"
                },
                {
                    title: "CSV Fields",
                    regex: "(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)",
                    description: "Parses CSV fields, handles quoted values"
                }
            ],
            advanced: [
                {
                    title: "Balanced Parentheses",
                    regex: "\\(([^()]|\\([^()]*\\))*\\)",
                    description: "Matches balanced parentheses (one level deep)"
                },
                {
                    title: "Mathematical Expressions",
                    regex: "^[-+]?\\d*\\.?\\d+([eE][-+]?\\d+)?$",
                    description: "Matches floating-point numbers with scientific notation"
                },
                {
                    title: "Unicode Emoji",
                    regex: "[\\u{1F600}-\\u{1F64F}]|[\\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\\u{1F6FF}]|[\\u{1F1E0}-\\u{1F1FF}]",
                    description: "Matches common Unicode emoji ranges"
                },
                {
                    title: "Base64 Encoded",
                    regex: "^[A-Za-z0-9+/]*={0,2}$",
                    description: "Validates Base64 encoded strings"
                }
            ]
        };
    }

    setupEditors() {
        // Regex Input Editor
        this.regexEditor = CodeMirror(document.getElementById('regexInput'), {
            mode: 'javascript',
            theme: this.isDarkMode ? 'monokai' : 'default',
            lineWrapping: true,
            placeholder: 'Enter your regular expression...',
            extraKeys: {
                'Ctrl-Enter': () => this.testRegex(),
                'Tab': false
            }
        });

        // Test String Editor
        this.testEditor = CodeMirror(document.getElementById('testStringInput'), {
            mode: 'text/plain',
            theme: this.isDarkMode ? 'monokai' : 'default',
            lineWrapping: true,
            placeholder: 'Enter your test string here...',
            extraKeys: {
                'Ctrl-Enter': () => this.testRegex()
            }
        });

        // Editor change listeners
        this.regexEditor.on('change', () => {
            this.updateRegexInfo();
            this.debounceTest();
        });

        this.testEditor.on('change', () => {
            this.updateTextInfo();
            this.debounceTest();
        });
    }

    setupEventListeners() {
        // Buttons
        document.getElementById('testBtn').addEventListener('click', () => this.testRegex());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('clearTextBtn').addEventListener('click', () => this.clearText());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareRegex());
        document.getElementById('libraryBtn').addEventListener('click', () => this.showLibrary());
        document.getElementById('explainBtn').addEventListener('click', () => this.explainRegex());
        document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());

        // Flags
        const flags = ['G', 'I', 'M', 'S', 'U', 'Y'];
        flags.forEach(flag => {
            document.getElementById(`flag${flag}`).addEventListener('change', () => {
                this.debounceTest();
            });
        });

        // Modal handlers
        this.setupModalHandlers();
        this.setupLibraryHandlers();
        this.setupExportHandlers();
    }

    setupModalHandlers() {
        const modals = ['library', 'help', 'export'];
        modals.forEach(modalName => {
            const modal = document.getElementById(`${modalName}Modal`);
            const closeBtn = modal.querySelector('.modal-close');

            closeBtn.addEventListener('click', () => this.hideModal(modalName));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modalName);
            });
        });
    }

    setupLibraryHandlers() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.showPatterns(e.target.dataset.category);
            });
        });
    }

    setupExportHandlers() {
        document.getElementById('exportTxt').addEventListener('click', () => this.exportResults('txt'));
        document.getElementById('exportJson').addEventListener('click', () => this.exportResults('json'));
        document.getElementById('exportCsv').addEventListener('click', () => this.exportResults('csv'));
    }

    setupTheme() {
        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.testRegex();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearAll();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.showLibrary();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleDarkMode();
                        break;
                    case 's':
                        e.preventDefault();
                        this.showExportModal();
                        break;
                }
            }
        });
    }

    debounceTest() {
        clearTimeout(this.testTimeout);
        this.testTimeout = setTimeout(() => this.testRegex(), 300);
    }

    testRegex() {
        const regexPattern = this.regexEditor.getValue().trim();
        const testString = this.testEditor.getValue();

        if (!regexPattern) {
            this.clearResults();
            this.updateRegexStatus('Enter a regex pattern', 'neutral');
            return;
        }

        try {
            const startTime = performance.now();
            const flags = this.getSelectedFlags();
            const regex = new RegExp(regexPattern, flags);

            this.currentMatches = [];
            this.currentGroups = [];

            if (flags.includes('g')) {
                // Global matching
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    this.currentMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: [...match],
                        namedGroups: match.groups || {}
                    });

                    // Prevent infinite loop
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                }
            } else {
                // Single match
                const match = regex.exec(testString);
                if (match) {
                    this.currentMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: [...match],
                        namedGroups: match.groups || {}
                    });
                }
            }

            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);

            this.updateRegexStatus(`Valid regex - ${this.currentMatches.length} matches found`, 'valid');
            this.displayResults();
            this.highlightMatches();
            this.updateAnalysis(executionTime, regexPattern);

        } catch (error) {
            this.updateRegexStatus(`Invalid regex: ${error.message}`, 'error');
            this.clearResults();
        }
    }

    getSelectedFlags() {
        const flags = [];
        ['G', 'I', 'M', 'S', 'U', 'Y'].forEach(flag => {
            if (document.getElementById(`flag${flag}`).checked) {
                flags.push(flag.toLowerCase());
            }
        });
        return flags.join('');
    }

    displayResults() {
        this.displayMatches();
        this.displayGroups();
        this.updateMatchCounter();
    }

    displayMatches() {
        const container = document.getElementById('matchResults');

        if (this.currentMatches.length === 0) {
            container.innerHTML = '<div class="no-matches">No matches found</div>';
            return;
        }

        const matchesHtml = this.currentMatches.map((match, index) => `
            <div class="match-item" data-match-index="${index}">
                <div>
                    <div class="match-text">${this.escapeHtml(match.match)}</div>
                    <div class="match-position">Position: ${match.index}-${match.index + match.match.length - 1}</div>
                </div>
                <button class="btn btn-secondary copy-match" data-text="${this.escapeHtml(match.match)}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = matchesHtml;

        // Add copy functionality
        container.querySelectorAll('.copy-match').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(btn.dataset.text);
            });
        });

        // Add match highlighting on hover
        container.querySelectorAll('.match-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const index = parseInt(item.dataset.matchIndex);
                this.highlightMatch(index, true);
            });
            item.addEventListener('mouseleave', () => {
                this.highlightMatches();
            });
        });
    }

    displayGroups() {
        const container = document.getElementById('groupResults');

        if (this.currentMatches.length === 0 || this.currentMatches.every(m => m.groups.length <= 1)) {
            container.innerHTML = '<div class="no-groups">No capturing groups found</div>';
            return;
        }

        // Create groups table
        let tableHtml = `
            <table class="group-table">
                <thead>
                    <tr>
                        <th>Match</th>
                        <th>Group</th>
                        <th>Value</th>
                        <th>Position</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.currentMatches.forEach((match, matchIndex) => {
            match.groups.forEach((group, groupIndex) => {
                if (groupIndex === 0) return; // Skip full match

                const groupValue = group || '';
                const position = group ? this.findGroupPosition(match.match, group, match.index) : '';

                tableHtml += `
                    <tr>
                        <td>${matchIndex + 1}</td>
                        <td>${groupIndex}</td>
                        <td>${this.escapeHtml(groupValue)}</td>
                        <td>${position}</td>
                    </tr>
                `;
            });
        });

        tableHtml += '</tbody></table>';
        container.innerHTML = tableHtml;
    }

    findGroupPosition(fullMatch, group, matchIndex) {
        if (!group) return '-';
        const groupIndex = fullMatch.indexOf(group);
        if (groupIndex === -1) return '-';
        const start = matchIndex + groupIndex;
        return `${start}-${start + group.length - 1}`;
    }

    highlightMatches() {
        const testString = this.testEditor.getValue();
        let highlightedText = '';
        let lastIndex = 0;

        // Sort matches by position
        const sortedMatches = [...this.currentMatches].sort((a, b) => a.index - b.index);

        sortedMatches.forEach((match, index) => {
            // Add text before match
            highlightedText += this.escapeHtml(testString.slice(lastIndex, match.index));

            // Add highlighted match
            highlightedText += `<span class="highlight" data-match-index="${index}">${this.escapeHtml(match.match)}</span>`;

            lastIndex = match.index + match.match.length;
        });

        // Add remaining text
        highlightedText += this.escapeHtml(testString.slice(lastIndex));

        // Update highlight layer
        const highlightLayer = document.getElementById('highlightLayer');
        highlightLayer.innerHTML = highlightedText;
    }

    highlightMatch(index, active = false) {
        const highlights = document.querySelectorAll('.highlight');
        highlights.forEach((highlight, i) => {
            highlight.classList.toggle('active', i === index && active);
        });
    }

    updateMatchCounter() {
        const counter = document.getElementById('matchCount');
        const count = this.currentMatches.length;
        counter.textContent = `${count} ${count === 1 ? 'match' : 'matches'}`;
    }

    updateRegexInfo() {
        const pattern = this.regexEditor.getValue();
        const length = document.getElementById('regexLength');
        length.textContent = `${pattern.length} characters`;
    }

    updateTextInfo() {
        const text = this.testEditor.getValue();
        const length = document.getElementById('textLength');
        const lines = document.getElementById('lineCount');

        length.textContent = `${text.length} characters`;
        lines.textContent = `${text.split('\n').length} lines`;
    }

    updateRegexStatus(message, type) {
        const status = document.getElementById('regexStatus');
        status.textContent = message;
        status.className = `status ${type}`;
    }

    updateAnalysis(executionTime, pattern) {
        document.getElementById('perfTime').textContent = `${executionTime}ms`;

        // Simple complexity analysis
        let complexity = 'Low';
        if (pattern.includes('*') || pattern.includes('+') || pattern.includes('{')) {
            complexity = pattern.includes('.*') || pattern.includes('.+') ? 'High' : 'Medium';
        }
        document.getElementById('complexity').textContent = complexity;
    }

    clearResults() {
        document.getElementById('matchResults').innerHTML = '<div class="no-matches">No matches found</div>';
        document.getElementById('groupResults').innerHTML = '<div class="no-groups">No capturing groups found</div>';
        document.getElementById('highlightLayer').innerHTML = '';
        document.getElementById('matchCount').textContent = '0 matches';
        document.getElementById('perfTime').textContent = '-';
        document.getElementById('complexity').textContent = '-';
        this.currentMatches = [];
        this.currentGroups = [];
    }

    clearAll() {
        this.regexEditor.setValue('');
        this.testEditor.setValue('');
        this.clearResults();
        this.updateRegexStatus('Enter a regex pattern', 'neutral');

        // Clear flags
        ['G', 'I', 'M', 'S', 'U', 'Y'].forEach(flag => {
            document.getElementById(`flag${flag}`).checked = false;
        });
    }

    clearText() {
        this.testEditor.setValue('');
        this.clearResults();
    }

    loadSampleData() {
        const sampleRegex = '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b';
        const sampleText = `Contact us at:
support@example.com
info@test-site.org
admin@my-company.co.uk
sales@startup123.io

Invalid emails:
@invalid.com
test@
incomplete@domain
spaces in@email.com`;

        this.regexEditor.setValue(sampleRegex);
        this.testEditor.setValue(sampleText);
        document.getElementById('flagG').checked = true;

        setTimeout(() => this.testRegex(), 100);
    }

    shareRegex() {
        const regex = this.regexEditor.getValue();
        const testString = this.testEditor.getValue();
        const flags = this.getSelectedFlags();

        const shareData = {
            regex,
            testString,
            flags,
            timestamp: new Date().toISOString()
        };

        const shareUrl = `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(shareData))}`;

        if (navigator.share) {
            navigator.share({
                title: 'RegEx Tester Pro - Shared Pattern',
                text: `Regex pattern: /${regex}/${flags}`,
                url: shareUrl
            });
        } else {
            this.copyToClipboard(shareUrl);
            this.showNotification('Share URL copied to clipboard!');
        }
    }

    explainRegex() {
        const pattern = this.regexEditor.getValue().trim();
        if (!pattern) {
            this.showNotification('Enter a regex pattern first');
            return;
        }

        // Open regex explanation in new tab
        const explainUrl = `https://regex101.com/?regex=${encodeURIComponent(pattern)}&flags=${this.getSelectedFlags()}`;
        window.open(explainUrl, '_blank');
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);

        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
            this.regexEditor.setOption('theme', 'monokai');
            this.testEditor.setOption('theme', 'monokai');
        } else {
            document.body.removeAttribute('data-theme');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i>';
            this.regexEditor.setOption('theme', 'default');
            this.testEditor.setOption('theme', 'default');
        }
    }

    showLibrary() {
        this.showModal('library');
        this.showPatterns('common');
    }

    showPatterns(category) {
        const container = document.getElementById('libraryPatterns');
        const patterns = this.patterns[category] || [];

        if (patterns.length === 0) {
            container.innerHTML = '<div class="no-patterns">No patterns available</div>';
            return;
        }

        const patternsHtml = patterns.map(pattern => `
            <div class="pattern-item" data-regex="${this.escapeHtml(pattern.regex)}">
                <div class="pattern-title">${pattern.title}</div>
                <div class="pattern-regex">/${pattern.regex}/</div>
                <div class="pattern-description">${pattern.description}</div>
            </div>
        `).join('');

        container.innerHTML = patternsHtml;

        // Add click handlers
        container.querySelectorAll('.pattern-item').forEach(item => {
            item.addEventListener('click', () => {
                this.regexEditor.setValue(item.dataset.regex);
                this.hideModal('library');
                this.testRegex();
            });
        });
    }

    showHelp() {
        this.showModal('help');
    }

    showExportModal() {
        if (this.currentMatches.length === 0) {
            this.showNotification('No results to export');
            return;
        }

        this.showModal('export');
        this.updateExportPreview('txt');
    }

    updateExportPreview(format) {
        const preview = document.getElementById('exportPreview');
        let content = '';

        switch (format) {
            case 'txt':
                content = this.generateTextExport();
                break;
            case 'json':
                content = this.generateJsonExport();
                break;
            case 'csv':
                content = this.generateCsvExport();
                break;
        }

        preview.value = content;
    }

    generateTextExport() {
        const regex = this.regexEditor.getValue();
        const flags = this.getSelectedFlags();
        const timestamp = new Date().toLocaleString();

        let content = `RegEx Tester Pro - Export Results\n`;
        content += `Generated: ${timestamp}\n`;
        content += `Pattern: /${regex}/${flags}\n`;
        content += `Matches: ${this.currentMatches.length}\n\n`;

        this.currentMatches.forEach((match, index) => {
            content += `Match ${index + 1}:\n`;
            content += `  Text: "${match.match}"\n`;
            content += `  Position: ${match.index}-${match.index + match.match.length - 1}\n`;

            if (match.groups.length > 1) {
                content += `  Groups:\n`;
                match.groups.slice(1).forEach((group, groupIndex) => {
                    content += `    Group ${groupIndex + 1}: "${group || ''}"\n`;
                });
            }
            content += '\n';
        });

        return content;
    }

    generateJsonExport() {
        return JSON.stringify({
            regex: this.regexEditor.getValue(),
            flags: this.getSelectedFlags(),
            testString: this.testEditor.getValue(),
            matches: this.currentMatches,
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    generateCsvExport() {
        let csv = 'Match,Text,Position,Length,Groups\n';

        this.currentMatches.forEach((match, index) => {
            const groups = match.groups.slice(1).map(g => g || '').join(';');
            csv += `${index + 1},"${match.match.replace(/"/g, '""')}",${match.index},${match.match.length},"${groups}"\n`;
        });

        return csv;
    }

    exportResults(format) {
        const content = format === 'txt' ? this.generateTextExport() :
            format === 'json' ? this.generateJsonExport() :
                this.generateCsvExport();

        const blob = new Blob([content], {
            type: format === 'json' ? 'application/json' : 'text/plain'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `regex-results.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.hideModal('export');
        this.showNotification(`Results exported as ${format.toUpperCase()}`);
    }

    showModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    hideModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Copied to clipboard!');
        }
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--success-color);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load shared regex from URL hash
    loadSharedRegex() {
        if (window.location.hash) {
            try {
                const data = JSON.parse(atob(window.location.hash.slice(1)));
                this.regexEditor.setValue(data.regex || '');
                this.testEditor.setValue(data.testString || '');

                // Set flags
                ['G', 'I', 'M', 'S', 'U', 'Y'].forEach(flag => {
                    const checkbox = document.getElementById(`flag${flag}`);
                    checkbox.checked = data.flags && data.flags.includes(flag.toLowerCase());
                });

                setTimeout(() => this.testRegex(), 100);
            } catch (e) {
                console.warn('Invalid share URL');
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RegexTesterPro();

    // Load shared regex if present
    app.loadSharedRegex();

    // Handle browser navigation
    window.addEventListener('hashchange', () => {
        app.loadSharedRegex();
    });
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
