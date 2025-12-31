/**
 * Links Module
 * Quick bookmarks management
 */

const Links = {
    panel: null,
    list: null,
    toggleBtn: null,
    nameInput: null,
    urlInput: null,
    addBtn: null,
    links: [],

    init() {
        this.panel = document.getElementById('linksPanel');
        this.list = document.getElementById('linksList');
        this.toggleBtn = document.getElementById('linksBtn');
        this.nameInput = document.getElementById('linkName');
        this.urlInput = document.getElementById('linkUrl');
        this.addBtn = document.getElementById('addLinkBtn');

        this.load();
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.panel.classList.toggle('active');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        // Add link
        this.addBtn.addEventListener('click', () => this.addLink());

        // Add on Enter in URL field
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addLink();
            }
        });
    },

    load() {
        this.links = Storage.get('quickLinks', [
            { id: 1, name: 'Google', url: 'https://google.com' },
            { id: 2, name: 'Gmail', url: 'https://gmail.com' },
            { id: 3, name: 'YouTube', url: 'https://youtube.com' }
        ]);
    },

    save() {
        Storage.set('quickLinks', this.links);
    },

    addLink() {
        const name = this.nameInput.value.trim();
        let url = this.urlInput.value.trim();

        if (!name || !url) return;

        // Ensure URL has protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        this.links.push({
            id: Date.now(),
            name: name,
            url: url
        });

        this.nameInput.value = '';
        this.urlInput.value = '';
        this.save();
        this.render();
    },

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.save();
        this.render();
    },

    render() {
        this.list.innerHTML = '';

        this.links.forEach(link => {
            const div = document.createElement('div');
            div.className = 'link-item';
            div.innerHTML = `
        <a href="${this.escapeHtml(link.url)}" target="_blank" rel="noopener">${this.escapeHtml(link.name)}</a>
        <button class="delete-link">✕</button>
      `;

            div.querySelector('.delete-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteLink(link.id);
            });

            this.list.appendChild(div);
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
