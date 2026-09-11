console.log('✅ arsip.js file LOADED');

/**
 * SIPARS - Sistem Informasi Pengarsipan
 * Main Alpine.js Application State & Methods
 * Version: 2.0 - Full Integration
 */

window.app = function () {
    console.log('✅ app() function called by Alpine.js');

    return {

        // ============================================
        // 1. UI STATE
        // ============================================
        sidebarOpen: false,
        view: 'dashboard',
        query: '',
        page: 1,
        perPage: 10,
        mobileSearchOpen: false,

        // ============================================
        // 2. MODAL STATES
        // ============================================
        modalOpen: false,
        previewOpen: false,
        profileEdit: false,
        passwordModal: false,
        twoFAModal: false,
        sessionsModal: false,
        updateModal: false,

        // ============================================
        // 3. ARSIP DATA & FORM
        // ============================================
        categories: ['Surat Masuk', 'Surat Keluar', 'Kepegawaian', 'Keuangan', 'Laporan', 'SK', 'Inventaris IT'],
        statuses: ['Draft', 'Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
        roles: ['Admin Utama', 'Operator Kominfo', 'User Unit', 'Viewer'],
        roleInfo: {
            'Admin Utama': 'Akses penuh ke semua fitur arsip dan manajemen pengguna',
            'Operator Kominfo': 'Mengelola, verifikasi, dan publikasikan dokumen arsip',
            'User Unit': 'Akses melihat, meminjam, dan download dokumen arsip',
            'Viewer': 'Akses baca saja untuk semua dokumen yang dipublikasikan'
        },
        roleEmojis: {
            'Admin Utama': '👑',
            'Operator Kominfo': '⚙',
            'User Unit': '👤',
            'Viewer': '👁'
        },

        stats: { total: 0, new30: 0, pending: 0 },
        items: [],
        users: [],
        previewItem: {},
        editing: false,
        form: {
            id: null,
            title: '',
            code: '',
            category: 'Surat Masuk',
            year: (new Date()).getFullYear(),
            status: 'Draft',
            file: null,
            fileDataUrl: null,
            allowedRoles: []
        },
        userForm: { id: null, name: '', email: '', role: 'User Unit', status: 'Aktif' },
        showUserModal: false,
        editingUser: false,

        // ============================================
        // 4. PEMINJAMAN (BORROWING) STATE
        // ============================================
        borrowings: [],
        showBorrowModal: false,
        borrowForm: {
            id: null,
            archiveId: '',
            borrowDate: '',
            returnDate: '',
            notes: '',
            status: 'Pending'
        },
        borrowingStatuses: ['Pending', 'Disetujui', 'Dikembalikan', 'Ditolak'],
        borrowingPage: 1,
        borrowingPerPage: 10,
        borrowingFilter: { status: '', user: '' },

        // ============================================
        // 5. PROFILE & SETTINGS
        // ============================================
        profile: {
            name: 'Administrator',
            email: 'admin@kominfo.deiyai.go.id',
            phone: '',
            status: 'Aktif',
            joinDate: new Date().toLocaleDateString('id-ID'),
            lastLogin: new Date().toLocaleString('id-ID')
        },
        settings: {
            darkMode: true,
            desktopNotif: true,
            autoSidebar: true,
            emailNotif: true,
            newArchiveAlert: true,
            weeklyReport: false
        },
        passwordForm: {
            current: '',
            new: '',
            confirm: ''
        },
        activeSessions: [
            { id: 1, device: 'Chrome - Windows 10', location: 'Jayapura, ID', time: new Date().toLocaleString('id-ID'), current: true }
        ],

        // ============================================
        // 6. NOTIFICATIONS
        // ============================================
        notificationDropdown: false,
        notifications: [],
        unreadCount: 0,

        // ============================================
        // 7. LOADING & UI STATES
        // ============================================
        loading: false,
        loadingMessage: 'Loading...',
        uploadProgress: 0,
        isUploading: false,

        // ============================================
        // 8. BREADCRUMB & NAVIGATION
        // ============================================
        breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],

        // ============================================
        // 9. ADVANCED FILTERS
        // ============================================
        showAdvancedFilter: false,
        filterPresets: [],
        currentFilter: { status: '', category: '', dateRange: '', author: '' },
        searchHistory: [],

        // ============================================
        // 10. WIDGET MANAGEMENT
        // ============================================
        showWidgetManager: false,
        widgets: [
            { id: 'stats', label: 'Statistik', visible: true },
            { id: 'trend', label: 'Tren Upload', visible: true },
            { id: 'status', label: 'Distribusi Status', visible: true },
            { id: 'categories', label: 'Top Kategori', visible: true },
            { id: 'downloads', label: 'Most Downloaded', visible: true }
        ],
        _draggedWidget: null,

        // ============================================
        // 11. EXPORT & SCHEDULING
        // ============================================
        showExportModal: false,
        showScheduleModal: false,
        exportFormat: 'csv',
        exportFields: [
            { name: 'title', label: 'Judul', selected: true },
            { name: 'code', label: 'Kode', selected: true },
            { name: 'category', label: 'Kategori', selected: true },
            { name: 'year', label: 'Tahun', selected: true },
            { name: 'status', label: 'Status', selected: true }
        ],
        scheduleForm: { frequency: 'daily', time: '09:00', email: '' },
        scheduledExports: [],

        // ============================================
        // 12. SEARCH & CONTEXT HELP
        // ============================================
        showSearchDropdown: false,
        searchSuggestions: [],
        savedSearchFilters: [],
        recentSearches: [],
        showContextHelp: false,
        contextHelpText: '',

        // ============================================
        // 13. LAPORAN STATE
        // ============================================
        laporanPeriod: 'monthly',
        laporanYear: new Date().getFullYear(),

        // ============================================
        // 14. USER & ROLE
        // ============================================
        currentRole: 'Admin Utama',
        permissions: [],

        // ============================================
        // 15. CHART REFERENCES
        // ============================================
        _chartUploads: null,
        _chartStatus: null,
        _chartInitTimer: null,   // debounce timer for initCharts()
        _initialized: false,

        // ============================================
        // ============================================
        // INIT & CORE METHODS
        // ============================================
        // ============================================

        init() {
            if (this._initialized) {
                console.log('⚠ init() already called, skipping...');
                return;
            }
            console.log('🎬 init() starting...');

            // Load role dari localStorage (set oleh index.html)
            const savedRole = localStorage.getItem('userRole');
            if (savedRole && this.roles.includes(savedRole)) {
                this.currentRole = savedRole;
                console.log('✅ Role loaded from localStorage:', this.currentRole);
            }

            // Load profile dari localStorage
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                try {
                    this.profile = { ...this.profile, ...JSON.parse(savedProfile) };
                } catch (e) { /* keep defaults */ }
            }

            // Load widget preferences
            const savedWidgets = localStorage.getItem('widgetPreferences');
            if (savedWidgets) {
                try {
                    const prefs = JSON.parse(savedWidgets);
                    prefs.forEach(pref => {
                        const w = this.widgets.find(x => x.id === pref.id);
                        if (w) w.visible = pref.visible;
                    });
                } catch (e) { /* keep defaults */ }
            }

            // Load scheduled exports
            const savedSchedules = localStorage.getItem('scheduledExports');
            if (savedSchedules) {
                try { this.scheduledExports = JSON.parse(savedSchedules); } catch (e) { }
            }

            // Build sample items in chunks
            this._buildItems();

            this._initialized = true;
            console.log('✅ init() completed');
        },

        /**
         * Build 60 sample archive items in async chunks to avoid blocking UI
         */
        _buildItems() {
            const chunkSize = 15;
            const totalItems = 60;

            const populateChunk = (startIdx) => {
                if (startIdx >= totalItems) {
                    // All items loaded — finish setup
                    this.applyRole();
                    this.loadBorrowings();
                    this.loadSettings();
                    this.initNotifications();
                    this._buildUsers();
                    this._updateStats();

                    // Init charts after DOM is ready — use delay so x-if widgets mount first
                    this.$nextTick(() => {
                        setTimeout(() => this.initCharts(), 200);
                    });

                    console.log('✅ All data loaded. Items:', this.items.length);
                    return;
                }

                const endIdx = Math.min(startIdx + chunkSize, totalItems);
                for (let i = startIdx + 1; i <= endIdx; i++) {
                    const statusOptions = ['Draft', 'Menunggu Verifikasi', 'Disetujui', 'Disetujui', 'Disetujui'];
                    const status = i % 5 === 0 ? 'Menunggu Verifikasi' : (i % 7 === 0 ? 'Draft' : 'Disetujui');
                    const cat = this.categories[i % this.categories.length];
                    const month = i % 12;
                    const day = (i % 27) + 1;
                    const year = 2025 - (i % 3);
                    const code = `DOC-${String(i).padStart(4, '0')}`;
                    this.items.push({
                        id: i,
                        title: `${cat} Nomor ${i}`,
                        code: code,
                        category: cat,
                        year: year,
                        status: status,
                        file: 'sample.pdf',
                        size: Math.floor(Math.random() * 5000) + 100,
                        uploadedBy: ['Admin', 'Operator', 'User'][i % 3],
                        uploadedAt: new Date(2025, month, day),
                        downloads: Math.floor(Math.random() * 100)
                    });
                }
                setTimeout(() => populateChunk(endIdx), 30);
            };

            populateChunk(0);
        },

        /**
         * Build sample users list
         */
        _buildUsers() {
            this.users = [
                { id: 1, name: 'Budi Santoso', email: 'budi@kominfo.go.id', role: 'Admin Utama', status: 'Aktif', joinDate: '2024-01-10' },
                { id: 2, name: 'Siti Nurhaliza', email: 'siti@kominfo.go.id', role: 'Operator Kominfo', status: 'Aktif', joinDate: '2024-02-15' },
                { id: 3, name: 'Ahmad Wijaya', email: 'ahmad@deiyai.go.id', role: 'User Unit', status: 'Aktif', joinDate: '2024-03-20' },
                { id: 4, name: 'Rina Gunawan', email: 'rina@deiyai.go.id', role: 'Viewer', status: 'Aktif', joinDate: '2024-04-05' },
                { id: 5, name: 'Dedi Kurniawan', email: 'dedi@kominfo.go.id', role: 'Operator Kominfo', status: 'Nonaktif', joinDate: '2024-05-12' },
                { id: 6, name: 'Maria Yuliana', email: 'maria@deiyai.go.id', role: 'User Unit', status: 'Aktif', joinDate: '2024-06-01' },
            ];
            const savedUsers = localStorage.getItem('siparsUsers');
            if (savedUsers) {
                try { this.users = JSON.parse(savedUsers); } catch (e) { }
            }
            console.log('✅ Users loaded:', this.users.length);
        },

        /**
         * Recalculate dashboard stats from items array
         */
        _updateStats() {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            this.stats.total = this.items.length;
            this.stats.new30 = this.items.filter(i => new Date(i.uploadedAt) >= thirtyDaysAgo).length;
            this.stats.pending = this.items.filter(i => i.status === 'Menunggu Verifikasi').length;
            console.log('📊 Stats updated:', this.stats);
        },

        // ============================================
        // CHART INITIALIZATION
        // ============================================

        /**
         * Initialize both dashboard charts.
         * Called after items are loaded and DOM is ready.
         */
        /**
         * Safely destroy a Chart.js instance.
         * Also kills any orphaned instances Chart.js registered on the same canvas
         * (happens when the canvas was removed/recreated by x-if or rapid re-renders).
         * @param {Chart|null} instance - tracked instance reference
         * @param {HTMLCanvasElement|null} canvas - the canvas element
         * @returns {null} always returns null so caller can reset the ref
         */
        _destroyChart(instance, canvas) {
            // Destroy our tracked instance
            if (instance) {
                try { instance.destroy(); } catch (e) { /* already destroyed */ }
            }
            // Also destroy any orphaned instance Chart.js still has on this canvas
            // Chart.getChart() is available in Chart.js v3.2+
            if (canvas && typeof Chart !== 'undefined' && Chart.getChart) {
                const orphan = Chart.getChart(canvas);
                if (orphan) {
                    try { orphan.destroy(); } catch (e) { /* ignore */ }
                }
            }
            return null;
        },

        /**
         * Check if a canvas element is truly visible and ready for Chart.js.
         * Returns false if canvas is null, not in DOM, or CSS-hidden (display:none).
         * @param {HTMLCanvasElement|null} canvas
         */
        _canvasReady(canvas) {
            if (!canvas) return false;
            if (!document.body.contains(canvas)) return false;
            // offsetParent is null for display:none elements (and position:fixed, but
            // our canvases are not fixed, so this is a reliable visibility check)
            if (canvas.offsetParent === null && canvas.style.display === 'none') return false;
            // Check computed style as a fallback
            const style = window.getComputedStyle(canvas);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            return true;
        },

        /**
         * initCharts — public entry point.
         * Debounced: rapid repeated calls (e.g. clicking Dashboard many times)
         * will only run once after the last call settles (100ms window).
         */
        initCharts() {
            // Cancel any pending debounced init
            if (this._chartInitTimer) {
                clearTimeout(this._chartInitTimer);
            }
            this._chartInitTimer = setTimeout(() => {
                this._chartInitTimer = null;
                this._doInitCharts();
            }, 100);
        },

        _doInitCharts() {
            console.log('📈 _doInitCharts() called');
            this._initUploadTrendChart();
            this._initStatusChart();
        },

        _initUploadTrendChart() {
            const canvas = document.getElementById('chartUploads');

            // Always destroy existing instance (tracked + orphaned) first
            this._chartUploads = this._destroyChart(this._chartUploads, canvas);

            // Only proceed if canvas is genuinely visible in DOM
            if (!this._canvasReady(canvas)) {
                console.warn('⚠ chartUploads: canvas not ready, skipping');
                return;
            }

            // Build 30-day trend data
            const labels = [];
            const data = [];
            const now = new Date();
            for (let d = 29; d >= 0; d--) {
                const date = new Date(now);
                date.setDate(now.getDate() - d);
                labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                const count = this.items.filter(i => {
                    const up = new Date(i.uploadedAt);
                    return up.toDateString() === date.toDateString();
                }).length;
                data.push(count || Math.floor(Math.random() * 4));
            }

            // Detect light mode for axis label colours
            const isLight = document.body.classList.contains('light-mode');
            const labelColor = isLight ? '#475569' : '#9ca3af';
            const gridColor = isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.05)';
            const legendColor = isLight ? '#334155' : '#d1d5db';

            try {
                this._chartUploads = new Chart(canvas, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Upload Arsip',
                            data,
                            borderColor: 'rgba(99,102,241,1)',
                            backgroundColor: 'rgba(99,102,241,0.15)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 400 },
                        plugins: {
                            legend: { labels: { color: legendColor, font: { size: 12 } } }
                        },
                        scales: {
                            x: {
                                ticks: { color: labelColor, maxTicksLimit: 10 },
                                grid: { color: gridColor }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: { color: labelColor, stepSize: 1 },
                                grid: { color: gridColor }
                            }
                        }
                    }
                });
                console.log('✅ Upload trend chart initialized');
            } catch (e) {
                console.error('❌ Upload trend chart failed:', e);
                this._chartUploads = null;
            }
        },

        _initStatusChart() {
            const canvas = document.getElementById('statusChart');

            // Always destroy existing + orphaned instance first
            this._chartStatus = this._destroyChart(this._chartStatus, canvas);

            if (!this._canvasReady(canvas)) {
                console.warn('⚠ statusChart: canvas not ready, skipping');
                return;
            }

            const counts = this.statuses.map(s => this.items.filter(i => i.status === s).length);
            const isLight = document.body.classList.contains('light-mode');
            const legendColor = isLight ? '#334155' : '#d1d5db';

            try {
                this._chartStatus = new Chart(canvas, {
                    type: 'doughnut',
                    data: {
                        labels: this.statuses,
                        datasets: [{
                            data: counts,
                            backgroundColor: [
                                'rgba(251,191,36,0.8)',
                                'rgba(99,102,241,0.8)',
                                'rgba(16,185,129,0.8)',
                                'rgba(239,68,68,0.8)'
                            ],
                            borderColor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 400 },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: legendColor, font: { size: 11 }, padding: 12 }
                            }
                        }
                    }
                });
                console.log('✅ Status distribution chart initialized');
            } catch (e) {
                console.error('❌ Status chart failed:', e);
                this._chartStatus = null;
            }
        },

        // ════════════════════════════════════════
        // ALPINE HTML-ATTRIBUTE HELPERS
        // All && and complex logic moved here so HTML attrs stay simple.
        // Raw && in HTML attributes corrupts to &reg; in some browsers.
        // ════════════════════════════════════════

        /** x-show on search dropdown */
        shouldShowSearch() {
            return this.showSearchDropdown && this.hasSearchResults();
        },
        hasSearchResults() {
            return this.searchSuggestions.length > 0
                || this.recentSearches.length > 0
                || this.savedSearchFilters.length > 0;
        },
        /** x-if: show recent searches only when no suggestions */
        showRecentSearches() {
            return this.recentSearches.length > 0 && this.searchSuggestions.length === 0;
        },
        /** :class on chart/widget grid rows */
        chartGridClass() {
            const trend = this.widgets.find(w => w.id === 'trend')?.visible;
            const status = this.widgets.find(w => w.id === 'status')?.visible;
            return (trend && status) ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1';
        },
        bottomWidgetGridClass() {
            const cats = this.widgets.find(w => w.id === 'categories')?.visible;
            const downs = this.widgets.find(w => w.id === 'downloads')?.visible;
            return (cats && downs) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';
        },
        /** x-show on approve/reject buttons */
        canVerify(b) {
            return b.status === 'Pending' && this.hasPermission('verify');
        },

        /**
         * onViewChange — called by every sidebar/breadcrumb nav click.
         * When navigating TO dashboard: waits for Alpine x-show transition
         * to finish (200ms) before initialising charts, preventing the
         * "getContext of null" error caused by charts rendering on hidden canvas.
         */
        onViewChange(newView) {
            // If leaving dashboard, destroy charts immediately so their
            // animation loop doesn't keep running on a hidden canvas.
            if (this.view === 'dashboard' && newView !== 'dashboard') {
                this._chartUploads = this._destroyChart(
                    this._chartUploads,
                    document.getElementById('chartUploads')
                );
                this._chartStatus = this._destroyChart(
                    this._chartStatus,
                    document.getElementById('statusChart')
                );
                console.log('🗑 Charts destroyed on dashboard leave');
            }

            this.view = newView;
            this.updateBreadcrumb(newView);

            if (newView === 'dashboard') {
                // Wait for:
                // 1. Alpine to process x-show (next tick)
                // 2. CSS transition to finish showing the section (~150ms)
                // 3. x-if template widgets to mount their canvas elements
                // Using 200ms delay is reliable; $nextTick alone is not enough
                // because x-show only toggles CSS, it doesn't guarantee
                // the canvas is paint-ready by the time the microtask runs.
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.initCharts();
                    }, 200);
                });
            }
        },

        // ============================================
        // LOAD / SAVE HELPERS
        // ============================================

        loadBorrowings() {
            const saved = localStorage.getItem('borrowings');
            const sampleBorrowings = [
                { id: 1, archiveId: 1, archiveTitle: 'Surat Masuk Nomor 1', archiveCode: 'DOC-0001', borrower: 'Budi Santoso', borrowDate: '2026-01-10', returnDate: '2026-01-24', notes: 'Untuk laporan bulanan', status: 'Disetujui', createdAt: new Date('2026-01-10') },
                { id: 2, archiveId: 5, archiveTitle: 'Kepegawaian Nomor 5', archiveCode: 'DOC-0005', borrower: 'Siti Nurhaliza', borrowDate: '2026-01-08', returnDate: '2026-01-22', notes: 'Arsip divisi SDM', status: 'Pending', createdAt: new Date('2026-01-08') },
                { id: 3, archiveId: 10, archiveTitle: 'SK Nomor 10', archiveCode: 'DOC-0010', borrower: 'Ahmad Wijaya', borrowDate: '2025-12-27', returnDate: '2026-01-10', notes: 'Sudah dikembalikan', status: 'Dikembalikan', createdAt: new Date('2025-12-27'), returnedAt: new Date('2026-01-11') },
                { id: 4, archiveId: 15, archiveTitle: 'Keuangan Nomor 15', archiveCode: 'DOC-0015', borrower: 'Rina Gunawan', borrowDate: '2026-01-05', returnDate: '2026-01-19', notes: 'Audit internal', status: 'Ditolak', createdAt: new Date('2026-01-05') }
            ];
            if (saved) {
                try { this.borrowings = JSON.parse(saved); }
                catch (e) { this.borrowings = sampleBorrowings; this._saveBorrowingsLS(); }
            } else {
                this.borrowings = sampleBorrowings;
                this._saveBorrowingsLS();
            }
            console.log('📋 Borrowings loaded:', this.borrowings.length);
        },

        _saveBorrowingsLS() {
            try { localStorage.setItem('borrowings', JSON.stringify(this.borrowings)); }
            catch (e) { console.error('❌ Error saving borrowings:', e); }
        },

        loadSettings() {
            const savedDark = localStorage.getItem('setting_darkMode');
            if (savedDark !== null) {
                // Handle both JSON.stringify booleans AND raw string booleans
                // index.html stores: JSON.stringify(bool) → "true"/"false"
                // Older admin saves may have stored raw: true/false
                let isDark;
                try {
                    isDark = JSON.parse(savedDark);
                } catch (e) {
                    isDark = savedDark !== 'false';
                }
                this.settings.darkMode = isDark;
                if (!this.settings.darkMode) {
                    document.body.classList.add('light-mode');
                    document.documentElement.setAttribute('data-theme', 'light');
                } else {
                    document.body.classList.remove('light-mode');
                    document.documentElement.removeAttribute('data-theme');
                }
            } else {
                // No saved preference — default dark, clean up any stale attribute
                document.documentElement.removeAttribute('data-theme');
            }
        },

        /**
         * Toggle dark/light mode — single source of truth for admin.html
         * Saves with JSON.stringify so index.html can read it correctly too
         */
        toggleTheme() {
            this.settings.darkMode = !this.settings.darkMode;
            if (this.settings.darkMode) {
                document.body.classList.remove('light-mode');
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.body.classList.add('light-mode');
                document.documentElement.setAttribute('data-theme', 'light');
            }
            // Always save with JSON.stringify for cross-page consistency
            localStorage.setItem('setting_darkMode', JSON.stringify(this.settings.darkMode));
            console.log('🌓 Theme toggled:', this.settings.darkMode ? 'Dark' : 'Light');
        },

        applyRole() {
            localStorage.setItem('userRole', this.currentRole);
            const rolePermissions = {
                'Admin Utama': ['create', 'read', 'update', 'delete', 'verify', 'export', 'userMgmt', 'borrow'],
                'Operator Kominfo': ['create', 'read', 'update', 'verify', 'export', 'borrow'],
                'User Unit': ['read', 'borrow', 'export'],
                'Viewer': ['read']
            };
            this.permissions = rolePermissions[this.currentRole] || [];
            console.log('🎭 Role applied:', this.currentRole, '| Permissions:', this.permissions);
        },

        hasPermission(action) {
            return this.permissions && this.permissions.includes(action);
        },

        // ============================================
        // COMPUTED GETTERS
        // ============================================

        get filtered() {
            return this.items.filter(item => {
                const q = this.query.toLowerCase();
                const matchesSearch = !q ||
                    item.title.toLowerCase().includes(q) ||
                    item.code.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q);
                const matchesStatus = !this.currentFilter.status || item.status === this.currentFilter.status;
                const matchesCategory = !this.currentFilter.category || item.category === this.currentFilter.category;
                const matchesYear = !this.currentFilter.dateRange || String(item.year) === String(this.currentFilter.dateRange);
                const matchesAuthor = !this.currentFilter.author || item.code.toLowerCase().includes(this.currentFilter.author.toLowerCase()) || item.uploadedBy.toLowerCase().includes(this.currentFilter.author.toLowerCase());
                return matchesSearch && matchesStatus && matchesCategory && matchesYear && matchesAuthor;
            });
        },

        get paginated() {
            const start = (this.page - 1) * this.perPage;
            return this.filtered.slice(start, start + this.perPage);
        },

        get totalPages() {
            return Math.ceil(this.filtered.length / this.perPage) || 1;
        },

        getFilteredBorrowings() {
            return this.borrowings.filter(b => {
                const statusMatch = !this.borrowingFilter.status || b.status === this.borrowingFilter.status;
                const userMatch = !this.borrowingFilter.user || b.borrower.toLowerCase().includes(this.borrowingFilter.user.toLowerCase());
                return statusMatch && userMatch;
            });
        },

        get borrowingPaginated() {
            const filtered = this.getFilteredBorrowings();
            const start = (this.borrowingPage - 1) * this.borrowingPerPage;
            return filtered.slice(start, start + this.borrowingPerPage);
        },

        get borrowingTotalPages() {
            return Math.ceil(this.getFilteredBorrowings().length / this.borrowingPerPage) || 1;
        },

        get currentRoleDescription() {
            return this.roleInfo[this.currentRole] || 'Pengguna';
        },

        get topCategoriesHtml() {
            const categoryCount = {};
            this.items.forEach(item => {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            });
            const isLight = document.body.classList.contains('light-mode');
            const rowBg = isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.05)';
            const textColor = isLight ? '#374151' : 'rgba(255,255,255,0.80)';
            const numColor = isLight ? '#4338ca' : '#818cf8';
            return Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, count]) =>
                    `<li style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border-radius:0.5rem;background:${rowBg}">
                        <span style="font-size:0.875rem;color:${textColor}">${cat}</span>
                        <span style="font-weight:700;font-size:0.875rem;color:${numColor}">${count}</span>
                     </li>`)
                .join('');
        },

        // ============================================
        // NAVIGATION & BREADCRUMB
        // ============================================

        updateBreadcrumb(viewName) {
            const map = {
                'dashboard': [{ label: 'Dashboard', view: 'dashboard' }],
                'arsip': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Arsip', view: 'arsip' }],
                'peminjaman': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Peminjaman', view: 'peminjaman' }],
                'laporan': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Laporan', view: 'laporan' }],
                'pengguna': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Manajemen Pengguna', view: 'pengguna' }],
                'profil': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Profil', view: 'profil' }],
                'pengaturan': [{ label: 'Dashboard', view: 'dashboard' }, { label: 'Pengaturan', view: 'pengaturan' }],
            };
            this.breadcrumbs = map[viewName] || map['dashboard'];
        },

        // ============================================
        // ARSIP CRUD METHODS
        // ============================================

        openAddModal() {
            if (!this.hasPermission('create') && !this.hasPermission('update')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak memiliki izin untuk menambah arsip.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.editing = false;
            this.form = { id: null, title: '', code: '', category: 'Surat Masuk', year: new Date().getFullYear(), status: 'Draft', file: null, fileDataUrl: null, allowedRoles: [] };
            this.modalOpen = true;
        },

        closeModal() {
            this.modalOpen = false;
            this.editing = false;
            this.form = { id: null, title: '', code: '', category: 'Surat Masuk', year: new Date().getFullYear(), status: 'Draft', file: null, fileDataUrl: null, allowedRoles: [] };
        },

        onFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            this.form.file = file;
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => { this.form.fileDataUrl = e.target.result; };
                reader.readAsDataURL(file);
            }
        },

        edit(item) {
            if (!this.hasPermission('update')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak memiliki izin mengedit arsip.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.editing = true;
            this.form = { id: item.id, title: item.title, code: item.code, category: item.category, year: item.year, status: item.status, file: null, fileDataUrl: null, allowedRoles: [] };
            this.modalOpen = true;
        },

        save() {
            if (!this.form.title || !this.form.code) {
                Swal.fire({ icon: 'error', title: 'Validasi Error', text: 'Judul dan Kode arsip harus diisi!', confirmButtonColor: '#3b82f6' });
                return;
            }
            // Check duplicate code (exclude self when editing)
            const duplicate = this.items.find(i => i.code === this.form.code && i.id !== this.form.id);
            if (duplicate) {
                Swal.fire({ icon: 'error', title: 'Kode Duplikat', text: `Kode "${this.form.code}" sudah digunakan oleh arsip lain.`, confirmButtonColor: '#3b82f6' });
                return;
            }
            this.loading = true;
            this.loadingMessage = this.editing ? 'Menyimpan perubahan...' : 'Menambah dokumen...';
            setTimeout(() => {
                if (this.editing) {
                    const idx = this.items.findIndex(i => i.id === this.form.id);
                    if (idx !== -1) {
                        this.items[idx] = { ...this.items[idx], title: this.form.title, code: this.form.code, category: this.form.category, year: this.form.year, status: this.form.status };
                    }
                } else {
                    const newId = Math.max(...this.items.map(i => i.id), 0) + 1;
                    this.items.unshift({ id: newId, title: this.form.title, code: this.form.code, category: this.form.category, year: this.form.year, status: this.form.status, file: this.form.file ? this.form.file.name : 'sample.pdf', size: this.form.file ? this.form.file.size : 1024, uploadedBy: this.currentRole, uploadedAt: new Date(), downloads: 0 });
                }
                this._updateStats();
                this.loading = false;
                this.closeModal();
                Swal.fire({ icon: 'success', title: 'Berhasil', text: this.editing ? 'Dokumen berhasil diperbarui!' : 'Dokumen berhasil ditambahkan!', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
            }, 700);
        },

        delete(id) {
            if (!this.hasPermission('delete')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak memiliki izin menghapus arsip.', confirmButtonColor: '#3b82f6' });
                return;
            }
            Swal.fire({ title: 'Hapus Dokumen?', text: 'Data tidak dapat dikembalikan!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.items = this.items.filter(i => i.id !== id);
                        this._updateStats();
                        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Dokumen berhasil dihapus!', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                    }
                });
        },

        preview(item) {
            this.previewItem = item;
            this.previewOpen = true;
        },

        download(item) {
            const idx = this.items.findIndex(i => i.id === item.id);
            if (idx !== -1) this.items[idx].downloads++;
            Swal.fire({ icon: 'success', title: 'Download Dimulai', text: `${item.title} sedang diunduh...`, confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
        },

        addBorrowing(item) {
            if (!this.hasPermission('borrow')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Viewer tidak dapat meminjam arsip.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.borrowForm = { id: null, archiveId: item.id, borrowDate: new Date().toISOString().split('T')[0], returnDate: '', notes: '', status: 'Pending' };
            this.showBorrowModal = true;
        },

        // ============================================
        // PEMINJAMAN CRUD
        // ============================================

        openBorrowModal() {
            if (!this.hasPermission('borrow')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak dapat meminjam arsip.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.borrowForm = { id: null, archiveId: '', borrowDate: new Date().toISOString().split('T')[0], returnDate: '', notes: '', status: 'Pending' };
            this.showBorrowModal = true;
        },

        closeBorrowModal() {
            this.showBorrowModal = false;
            this.borrowForm = { id: null, archiveId: '', borrowDate: '', returnDate: '', notes: '', status: 'Pending' };
        },

        saveBorrowing() {
            if (!this.borrowForm.archiveId || !this.borrowForm.borrowDate || !this.borrowForm.returnDate) {
                Swal.fire({ icon: 'error', title: 'Validasi Error', text: 'Dokumen, tanggal pinjam, dan tanggal kembali harus diisi!', confirmButtonColor: '#3b82f6' });
                return;
            }
            if (new Date(this.borrowForm.returnDate) <= new Date(this.borrowForm.borrowDate)) {
                Swal.fire({ icon: 'error', title: 'Tanggal Invalid', text: 'Tanggal kembali harus setelah tanggal pinjam!', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.loading = true;
            this.loadingMessage = this.borrowForm.id ? 'Menyimpan perubahan...' : 'Menyimpan peminjaman...';
            setTimeout(() => {
                const archiveItem = this.items.find(i => i.id == this.borrowForm.archiveId);
                if (this.borrowForm.id) {
                    const idx = this.borrowings.findIndex(b => b.id === this.borrowForm.id);
                    if (idx !== -1) {
                        this.borrowings[idx] = { ...this.borrowings[idx], archiveId: this.borrowForm.archiveId, archiveTitle: archiveItem?.title || 'Unknown', archiveCode: archiveItem?.code || 'N/A', borrowDate: this.borrowForm.borrowDate, returnDate: this.borrowForm.returnDate, notes: this.borrowForm.notes };
                    }
                } else {
                    const newId = Math.max(...this.borrowings.map(b => b.id), 0) + 1;
                    this.borrowings.unshift({ id: newId, archiveId: this.borrowForm.archiveId, archiveTitle: archiveItem?.title || 'Unknown', archiveCode: archiveItem?.code || 'N/A', borrower: this.profile.name || this.currentRole, borrowDate: this.borrowForm.borrowDate, returnDate: this.borrowForm.returnDate, notes: this.borrowForm.notes, status: 'Pending', createdAt: new Date() });
                }
                this._saveBorrowingsLS();
                this.loading = false;
                this.closeBorrowModal();
                Swal.fire({ icon: 'success', title: 'Berhasil', text: this.borrowForm.id ? 'Peminjaman diperbarui!' : 'Permintaan peminjaman dikirim!', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
            }, 700);
        },

        editBorrowing(borrow) {
            this.borrowForm = { id: borrow.id, archiveId: borrow.archiveId, borrowDate: borrow.borrowDate, returnDate: borrow.returnDate, notes: borrow.notes, status: borrow.status };
            this.showBorrowModal = true;
        },

        deleteBorrowing(id) {
            if (!this.hasPermission('delete')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Hanya Admin Utama yang dapat menghapus peminjaman.', confirmButtonColor: '#3b82f6' });
                return;
            }
            Swal.fire({ title: 'Hapus Peminjaman?', text: 'Data peminjaman akan dihapus permanen!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.borrowings = this.borrowings.filter(b => b.id !== id);
                        this._saveBorrowingsLS();
                        Swal.fire({ icon: 'success', title: 'Terhapus', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                    }
                });
        },

        approveBorrowing(id) {
            if (!this.hasPermission('verify')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak dapat menyetujui peminjaman.', confirmButtonColor: '#3b82f6' });
                return;
            }
            const idx = this.borrowings.findIndex(b => b.id === id);
            if (idx !== -1) {
                this.borrowings[idx].status = 'Disetujui';
                this._saveBorrowingsLS();
                this.addNotification('✅', 'Peminjaman Disetujui', `Peminjaman "${this.borrowings[idx].archiveTitle}" telah disetujui.`);
                Swal.fire({ icon: 'success', title: 'Disetujui', text: 'Peminjaman telah disetujui!', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
            }
        },

        rejectBorrowing(id) {
            if (!this.hasPermission('verify')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Role Anda tidak dapat menolak peminjaman.', confirmButtonColor: '#3b82f6' });
                return;
            }
            Swal.fire({ title: 'Tolak Peminjaman?', input: 'textarea', inputPlaceholder: 'Alasan penolakan (opsional)...', icon: 'question', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Tolak', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        const idx = this.borrowings.findIndex(b => b.id === id);
                        if (idx !== -1) {
                            this.borrowings[idx].status = 'Ditolak';
                            if (result.value) this.borrowings[idx].rejectionReason = result.value;
                            this._saveBorrowingsLS();
                            Swal.fire({ icon: 'success', title: 'Ditolak', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                        }
                    }
                });
        },

        returnBorrowing(id) {
            Swal.fire({ title: 'Konfirmasi Pengembalian', text: 'Tandai dokumen ini sebagai sudah dikembalikan?', icon: 'info', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Kembalikan', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        const idx = this.borrowings.findIndex(b => b.id === id);
                        if (idx !== -1) {
                            this.borrowings[idx].status = 'Dikembalikan';
                            this.borrowings[idx].returnedAt = new Date();
                            this._saveBorrowingsLS();
                            Swal.fire({ icon: 'success', title: 'Dikembalikan', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                        }
                    }
                });
        },

        // ============================================
        // USER MANAGEMENT (Pengguna section)
        // ============================================

        get filteredUsers() {
            return this.users;
        },

        openAddUserModal() {
            if (!this.hasPermission('userMgmt')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Hanya Admin Utama yang dapat mengelola pengguna.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.editingUser = false;
            this.userForm = { id: null, name: '', email: '', role: 'User Unit', status: 'Aktif' };
            this.showUserModal = true;
        },

        editUser(user) {
            if (!this.hasPermission('userMgmt')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Hanya Admin Utama yang dapat mengelola pengguna.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.editingUser = true;
            this.userForm = { ...user };
            this.showUserModal = true;
        },

        saveUser() {
            if (!this.userForm.name || !this.userForm.email) {
                Swal.fire({ icon: 'error', title: 'Validasi Error', text: 'Nama dan email pengguna harus diisi!', confirmButtonColor: '#3b82f6' });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.userForm.email)) {
                Swal.fire({ icon: 'error', title: 'Email Invalid', text: 'Format email tidak valid!', confirmButtonColor: '#3b82f6' });
                return;
            }
            if (this.editingUser) {
                const idx = this.users.findIndex(u => u.id === this.userForm.id);
                if (idx !== -1) this.users[idx] = { ...this.userForm };
            } else {
                const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
                this.users.push({ ...this.userForm, id: newId, joinDate: new Date().toISOString().split('T')[0] });
            }
            localStorage.setItem('siparsUsers', JSON.stringify(this.users));
            this.showUserModal = false;
            Swal.fire({ icon: 'success', title: 'Berhasil', text: this.editingUser ? 'Data pengguna diperbarui!' : 'Pengguna baru ditambahkan!', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
        },

        deleteUser(id) {
            if (!this.hasPermission('userMgmt')) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', confirmButtonColor: '#3b82f6' });
                return;
            }
            Swal.fire({ title: 'Hapus Pengguna?', text: 'Pengguna akan dihapus dari sistem.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.users = this.users.filter(u => u.id !== id);
                        localStorage.setItem('siparsUsers', JSON.stringify(this.users));
                        Swal.fire({ icon: 'success', title: 'Terhapus', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                    }
                });
        },

        toggleUserStatus(user) {
            if (!this.hasPermission('userMgmt')) return;
            user.status = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
            localStorage.setItem('siparsUsers', JSON.stringify(this.users));
            Swal.fire({ icon: 'success', title: `Status diubah menjadi ${user.status}`, confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
        },

        // ============================================
        // FILTER & SEARCH
        // ============================================

        toggleAdvancedFilter() {
            this.showAdvancedFilter = !this.showAdvancedFilter;
        },

        applyAdvancedFilter() {
            this.page = 1;
            Swal.fire({ icon: 'info', title: 'Filter Diterapkan', text: `Menampilkan ${this.filtered.length} dokumen`, confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
        },

        clearAdvancedFilter() {
            this.currentFilter = { status: '', category: '', dateRange: '', author: '' };
            this.page = 1;
            this.showAdvancedFilter = false;
            Swal.fire({ icon: 'success', title: 'Filter Dihapus', confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
        },

        updateSearchSuggestions() {
            if (this.query.length < 2) { this.searchSuggestions = []; return; }
            const q = this.query.toLowerCase();
            const suggestions = [];
            this.items.forEach(item => {
                if ((item.title.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)) && suggestions.length < 4) {
                    suggestions.push({ text: item.title, type: '📄 Dokumen', icon: '📄', id: item.id });
                }
            });
            this.categories.forEach(cat => {
                if (cat.toLowerCase().includes(q) && suggestions.length < 6) {
                    suggestions.push({ text: cat, type: '📁 Kategori', icon: '📁', category: cat });
                }
            });
            this.searchSuggestions = suggestions;
            this.showSearchDropdown = suggestions.length > 0;
        },

        executeSearch() {
            if (!this.query.trim()) return;
            if (!this.recentSearches.includes(this.query)) {
                this.recentSearches.unshift(this.query);
                if (this.recentSearches.length > 10) this.recentSearches.pop();
            }
            this.page = 1;
            this.showSearchDropdown = false;
            this.view = 'arsip';
            this.updateBreadcrumb('arsip');
        },

        applySavedFilter(filterId) {
            const saved = this.savedSearchFilters.find(f => f.id === filterId);
            if (saved) {
                this.currentFilter = { ...saved.filters };
                this.query = saved.searchQuery || '';
                this.page = 1;
                this.showSearchDropdown = false;
                Swal.fire({ icon: 'success', title: 'Filter Diterapkan', text: `Filter "${saved.name}" aktif`, confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
            }
        },

        saveCurrentFilter() {
            if (!this.currentFilter.status && !this.currentFilter.category && !this.currentFilter.author && !this.currentFilter.dateRange) {
                Swal.fire({ icon: 'warning', title: 'Tidak Ada Filter', text: 'Atur filter terlebih dahulu.', confirmButtonColor: '#3b82f6' });
                return;
            }
            Swal.fire({ title: 'Simpan Filter', input: 'text', inputPlaceholder: 'Nama filter...', showCancelButton: true, confirmButtonText: 'Simpan', cancelButtonText: 'Batal', confirmButtonColor: '#3b82f6', preConfirm: v => v || Swal.showValidationMessage('Nama tidak boleh kosong') })
                .then(result => {
                    if (result.isConfirmed) {
                        const id = String(Date.now());
                        this.savedSearchFilters.push({ id, name: result.value, filters: { ...this.currentFilter }, searchQuery: this.query, createdAt: new Date() });
                        Swal.fire({ icon: 'success', title: 'Tersimpan', confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
                    }
                });
        },

        saveFilterPreset() {
            this.saveCurrentFilter();
        },

        deleteSavedFilter(filterId) {
            this.savedSearchFilters = this.savedSearchFilters.filter(f => f.id !== filterId);
        },

        // ============================================
        // PROFILE & ACCOUNT
        // ============================================

        closeEditProfile() {
            this.profileEdit = false;
        },

        saveProfile() {
            if (!this.profile.name || !this.profile.email) {
                Swal.fire({ icon: 'error', title: 'Validasi Error', text: 'Nama dan email harus diisi!', confirmButtonColor: '#3b82f6' });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.profile.email)) {
                Swal.fire({ icon: 'error', title: 'Email Invalid', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.loading = true;
            this.loadingMessage = 'Menyimpan profil...';
            setTimeout(() => {
                this.loading = false;
                this.closeEditProfile();
                localStorage.setItem('userProfile', JSON.stringify(this.profile));
                Swal.fire({ icon: 'success', title: 'Profil Diperbarui', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
            }, 700);
        },

        changePassword() {
            if (!this.passwordForm.current || !this.passwordForm.new || !this.passwordForm.confirm) {
                Swal.fire({ icon: 'error', title: 'Validasi Error', text: 'Semua field password harus diisi!', confirmButtonColor: '#3b82f6' });
                return;
            }
            if (this.passwordForm.new !== this.passwordForm.confirm) {
                Swal.fire({ icon: 'error', title: 'Password Tidak Cocok', text: 'Password baru dan konfirmasi berbeda!', confirmButtonColor: '#3b82f6' });
                return;
            }
            if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(this.passwordForm.new)) {
                Swal.fire({ icon: 'error', title: 'Password Lemah', text: 'Minimal 8 karakter, mengandung huruf dan angka.', confirmButtonColor: '#3b82f6' });
                return;
            }
            this.loading = true;
            this.loadingMessage = 'Mengubah password...';
            setTimeout(() => {
                this.loading = false;
                this.passwordModal = false;
                this.passwordForm = { current: '', new: '', confirm: '' };
                Swal.fire({ icon: 'success', title: 'Password Diubah', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
            }, 700);
        },

        enableTwoFA() {
            this.loading = true;
            this.loadingMessage = 'Mengaktifkan 2FA...';
            setTimeout(() => {
                this.loading = false;
                this.twoFAModal = false;
                Swal.fire({ icon: 'success', title: '2FA Aktif', text: 'Autentikasi 2 Faktor berhasil diaktifkan!', confirmButtonColor: '#3b82f6', timer: 3000, showConfirmButton: false });
            }, 800);
        },

        disable2FA() {
            Swal.fire({ title: 'Nonaktifkan 2FA?', text: 'Akun Anda akan lebih rentan tanpa 2FA.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Nonaktifkan', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) Swal.fire({ icon: 'success', title: '2FA Dinonaktifkan', confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                });
        },

        terminateSession(sessionId) {
            Swal.fire({ title: 'Akhiri Sesi?', text: 'Perangkat ini akan logout.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Akhiri', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        const idx = this.activeSessions.findIndex(s => s.id === sessionId);
                        if (idx !== -1) {
                            const device = this.activeSessions[idx].device;
                            this.activeSessions.splice(idx, 1);
                            Swal.fire({ icon: 'success', title: 'Sesi Diakhiri', text: `Sesi dari ${device} telah diakhiri.`, confirmButtonColor: '#3b82f6', timer: 1500, showConfirmButton: false });
                        }
                    }
                });
        },

        logout() {
            Swal.fire({ title: 'Logout?', text: 'Apakah Anda yakin ingin logout?', icon: 'question', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Logout', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userProfile');
                        Swal.fire({ icon: 'success', title: 'Logout Berhasil', text: 'Anda telah logout dari SIPARS.', confirmButtonColor: '#3b82f6', willClose: () => { window.location.href = 'index.html'; } });
                    }
                });
        },

        // ============================================
        // CONTEXT HELP
        // ============================================

        toggleContextHelp() {
            this.showContextHelp = !this.showContextHelp;
            if (this.showContextHelp) {
                const helpTexts = {
                    'dashboard': 'Dashboard menampilkan statistik dan grafik arsip. Gunakan ikon widget (🎛) untuk mengatur tampilan.',
                    'arsip': 'Kelola semua dokumen arsip. Gunakan tombol Filter untuk menyempurnakan pencarian, dan Export untuk mengunduh data.',
                    'peminjaman': 'Buat dan kelola permintaan peminjaman dokumen. Admin & Operator dapat menyetujui atau menolak permintaan.',
                    'laporan': 'Lihat statistik lengkap arsip dan peminjaman. Laporan dapat di-export ke CSV.',
                    'pengguna': 'Kelola daftar pengguna sistem, atur role dan status aktivasi.',
                    'profil': 'Perbarui data diri, ubah password, dan aktifkan keamanan 2FA.',
                    'pengaturan': 'Atur preferensi tampilan, notifikasi, dan laporan otomatis.'
                };
                this.contextHelpText = helpTexts[this.view] || 'Pilih menu di sidebar untuk navigasi antar fitur.';
            }
        },

        // ============================================
        // EXPORT METHODS
        // ============================================

        toggleExportModal() { this.showExportModal = !this.showExportModal; },

        toggleExportField(fieldName) {
            const f = this.exportFields.find(x => x.name === fieldName);
            if (f) f.selected = !f.selected;
        },

        exportToCSV() {
            const selectedFields = this.exportFields.filter(f => f.selected);
            if (!selectedFields.length) {
                Swal.fire({ icon: 'warning', title: 'Pilih Kolom', text: 'Pilih minimal satu kolom untuk di-export!', confirmButtonColor: '#3b82f6' });
                return;
            }
            const itemsToExport = this.filtered.length > 0 ? this.filtered : this.items;
            const headers = selectedFields.map(f => f.label).join(',');
            const rows = itemsToExport.map(item =>
                selectedFields.map(f => {
                    const v = String(item[f.name] || '').replace(/"/g, '""');
                    return v.includes(',') ? `"${v}"` : v;
                }).join(',')
            );
            const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); // BOM for Excel
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `arsip_export_${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.toggleExportModal();
            Swal.fire({ icon: 'success', title: 'Export Berhasil', text: `${itemsToExport.length} dokumen di-export ke CSV`, confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
        },

        exportToPDF() {
            const selectedFields = this.exportFields.filter(f => f.selected);
            if (!selectedFields.length) {
                Swal.fire({ icon: 'warning', title: 'Pilih Kolom', text: 'Pilih minimal satu kolom untuk di-export!', confirmButtonColor: '#3b82f6' });
                return;
            }
            const itemsToExport = this.filtered.length > 0 ? this.filtered : this.items;
            const printWindow = window.open('', '', 'height=700,width=900');
            let html = `<!DOCTYPE html><html><head><title>Export Arsip SIPARS</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
                h2 { color: #4f46e5; }
                p.meta { font-size:12px; color:#6b7280; margin-bottom:16px; }
                table { width:100%; border-collapse:collapse; font-size:13px; }
                th { background:#4f46e5; color:#fff; padding:8px 10px; text-align:left; }
                td { padding:7px 10px; border-bottom:1px solid #e5e7eb; }
                tr:nth-child(even) td { background:#f9fafb; }
            </style></head><body>
            <h2>📁 Laporan Arsip SIPARS</h2>
            <p class="meta">Dinas Kominfo Kabupaten Deiyai &nbsp;|&nbsp; Digenerate: ${new Date().toLocaleString('id-ID')}</p>
            <table><thead><tr>${selectedFields.map(f => `<th>${f.label}</th>`).join('')}</tr></thead><tbody>`;
            itemsToExport.forEach(item => {
                html += `<tr>${selectedFields.map(f => `<td>${item[f.name] || ''}</td>`).join('')}</tr>`;
            });
            html += `</tbody></table></body></html>`;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
            this.toggleExportModal();
            Swal.fire({ icon: 'success', title: 'Export Berhasil', text: `${itemsToExport.length} dokumen disiapkan untuk PDF`, confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
        },

        exportStatistics() {
            const approved = this.items.filter(i => i.status === 'Disetujui').length;
            const pending = this.items.filter(i => i.status === 'Menunggu Verifikasi').length;
            const draft = this.items.filter(i => i.status === 'Draft').length;
            const rejected = this.items.filter(i => i.status === 'Ditolak').length;
            const catCount = {};
            this.items.forEach(i => { catCount[i.category] = (catCount[i.category] || 0) + 1; });

            const rows = [
                ['LAPORAN STATISTIK ARSIP - SIPARS'],
                [`Tanggal,${new Date().toLocaleDateString('id-ID')}`],
                [],
                ['RINGKASAN'],
                [`Total Arsip,${this.items.length}`],
                [`Disetujui,${approved}`],
                [`Menunggu Verifikasi,${pending}`],
                [`Draft,${draft}`],
                [`Ditolak,${rejected}`],
                [`Total Peminjaman,${this.borrowings.length}`],
                [],
                ['DISTRIBUSI KATEGORI'],
                ['Kategori', 'Jumlah'],
                ...Object.entries(catCount).map(([k, v]) => [k, v]),
                [],
                ['DISTRIBUSI STATUS PEMINJAMAN'],
                ['Status', 'Jumlah'],
                ...this.borrowingStatuses.map(s => [s, this.borrowings.filter(b => b.status === s).length])
            ];

            const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `statistik_arsip_${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Swal.fire({ icon: 'success', title: 'Laporan Diunduh', text: 'Statistik arsip berhasil di-export ke CSV', confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
        },

        // ============================================
        // SCHEDULED EXPORT
        // ============================================

        toggleScheduleModal() { this.showScheduleModal = !this.showScheduleModal; },

        scheduleExport() {
            if (!this.scheduleForm.email) {
                Swal.fire({ icon: 'warning', title: 'Email Diperlukan', text: 'Masukkan email penerima laporan!', confirmButtonColor: '#3b82f6' });
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.scheduleForm.email)) {
                Swal.fire({ icon: 'warning', title: 'Email Tidak Valid', confirmButtonColor: '#3b82f6' });
                return;
            }
            const schedule = { id: Date.now(), ...this.scheduleForm, createdAt: new Date(), active: true };
            this.scheduledExports.push(schedule);
            localStorage.setItem('scheduledExports', JSON.stringify(this.scheduledExports));
            const savedEmail = this.scheduleForm.email;
            const savedFreq = this.scheduleForm.frequency;
            this.scheduleForm = { frequency: 'daily', time: '09:00', email: '' };
            Swal.fire({ icon: 'success', title: 'Jadwal Tersimpan', text: `Export ${savedFreq} akan dikirim ke ${savedEmail}`, confirmButtonColor: '#3b82f6', timer: 2000, showConfirmButton: false });
        },

        cancelScheduledExport(scheduleId) {
            Swal.fire({ title: 'Batalkan Jadwal?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Batalkan', cancelButtonText: 'Tidak' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.scheduledExports = this.scheduledExports.filter(s => s.id !== scheduleId);
                        localStorage.setItem('scheduledExports', JSON.stringify(this.scheduledExports));
                        Swal.fire({ icon: 'success', title: 'Jadwal Dihapus', confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
                    }
                });
        },

        // ============================================
        // WIDGET MANAGER
        // ============================================

        toggleWidgetManager() { this.showWidgetManager = !this.showWidgetManager; },

        toggleWidgetVisibility(widgetId) {
            const w = this.widgets.find(x => x.id === widgetId);
            if (w) {
                w.visible = !w.visible;
                localStorage.setItem('widgetPreferences', JSON.stringify(this.widgets));
                // Re-init charts if a chart widget is re-enabled.
                // Use same 200ms delay as onViewChange so canvas is in DOM first.
                if ((widgetId === 'trend' || widgetId === 'status') && w.visible) {
                    this.$nextTick(() => {
                        setTimeout(() => this.initCharts(), 200);
                    });
                }
            }
        },

        resetWidgetPreferences() {
            Swal.fire({ title: 'Reset Widget?', text: 'Semua widget dikembalikan ke default.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Reset', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.widgets.forEach(w => w.visible = true);
                        localStorage.removeItem('widgetPreferences');
                        this.$nextTick(() => {
                            setTimeout(() => this.initCharts(), 200);
                        });
                        Swal.fire({ icon: 'success', title: 'Reset Berhasil', confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
                    }
                });
        },

        startDragWidget(widget) { this._draggedWidget = widget; },

        dropWidget(dropTarget) {
            if (!this._draggedWidget || this._draggedWidget.id === dropTarget.id) return;
            const fromIdx = this.widgets.findIndex(w => w.id === this._draggedWidget.id);
            const toIdx = this.widgets.findIndex(w => w.id === dropTarget.id);
            if (fromIdx !== -1 && toIdx !== -1) {
                const [moved] = this.widgets.splice(fromIdx, 1);
                this.widgets.splice(toIdx, 0, moved);
                localStorage.setItem('widgetOrder', JSON.stringify(this.widgets.map(w => w.id)));
            }
            this._draggedWidget = null;
        },

        // ============================================
        // NOTIFICATIONS
        // ============================================

        initNotifications() {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                try {
                    this.notifications = JSON.parse(saved);
                    this.unreadCount = this.notifications.filter(n => !n.read).length;
                    return;
                } catch (e) { }
            }
            this.notifications = [
                { id: 1, icon: '📄', title: 'Dokumen Baru Tersedia', message: 'SK Pengangkatan Kepala Bagian telah dipublikasikan', time: 'Hari ini 10:30', read: false },
                { id: 2, icon: '✅', title: 'Peminjaman Disetujui', message: 'Permintaan peminjaman Anda telah disetujui', time: 'Kemarin 14:15', read: false },
                { id: 3, icon: '⏰', title: 'Pengingat Pengembalian', message: 'Dokumen harus dikembalikan dalam 2 hari', time: '2 hari yang lalu', read: true }
            ];
            this.unreadCount = 2;
        },

        addNotification(icon, title, message) {
            const newNotif = { id: Date.now(), icon, title, message, time: 'Baru saja', read: false };
            this.notifications.unshift(newNotif);
            this.unreadCount++;
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        },

        clearAllNotifications() {
            Swal.fire({ title: 'Hapus Semua Notifikasi?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal' })
                .then(result => {
                    if (result.isConfirmed) {
                        this.notifications = [];
                        this.unreadCount = 0;
                        localStorage.setItem('notifications', JSON.stringify([]));
                        Swal.fire({ icon: 'success', title: 'Notifikasi Dihapus', confirmButtonColor: '#3b82f6', timer: 1200, showConfirmButton: false });
                    }
                });
        },

        deleteNotification(id) {
            const idx = this.notifications.findIndex(n => n.id === id);
            if (idx !== -1) {
                if (!this.notifications[idx].read) this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.notifications.splice(idx, 1);
                localStorage.setItem('notifications', JSON.stringify(this.notifications));
            }
        },

        markAsRead(id) {
            const n = this.notifications.find(x => x.id === id);
            if (n && !n.read) {
                n.read = true;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                localStorage.setItem('notifications', JSON.stringify(this.notifications));
            }
        },

        markAsUnread(id) {
            const n = this.notifications.find(x => x.id === id);
            if (n && n.read) {
                n.read = false;
                this.unreadCount++;
                localStorage.setItem('notifications', JSON.stringify(this.notifications));
            }
        },
    };
};