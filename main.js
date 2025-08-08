// Global variables
let currentSection = 'users';
let sidebarOpen = false;
let currentTheme = localStorage.getItem('admin-theme') || 'dark';
let currentUser = null;

// API Base URL - matches your Spring Boot server configuration
const API_BASE_URL = window.location.origin;

// DOM elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const menuToggle = document.getElementById('menuToggle');
const pageTitle = document.getElementById('pageTitle');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupResponsiveMenu();
    setupThemeToggle();
    loadTheme();
    showSection('users');
    
    // Add keyboard navigation support
    setupKeyboardNavigation();
    
    // Initialize all sections
    initializeSections();
});

        // Enhanced Theme Management
        function setupThemeToggle() {
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        }

        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            saveTheme(currentTheme);
            
            // Announce theme change to screen readers
            const announcement = currentTheme === 'light' ? 'Switched to light theme' : 'Switched to dark theme';
            announceToScreenReader(announcement);
        }

        function applyTheme(theme) {
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                themeToggle.setAttribute('aria-label', 'Switch to dark theme');
            } else {
                document.documentElement.removeAttribute('data-theme');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
                themeToggle.setAttribute('aria-label', 'Switch to light theme');
            }
        }

        function saveTheme(theme) {
            localStorage.setItem('admin-theme', theme);
        }

        function loadTheme() {
            applyTheme(currentTheme);
        }

        // Enhanced Event Listeners
        function initializeEventListeners() {
            // Navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const section = this.getAttribute('data-section');
                    showSection(section);
                    if (window.innerWidth <= 1024) {
                        toggleSidebar(false);
                    }
                });
                
                // Keyboard navigation for nav links
                link.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });

            // Menu toggle
            menuToggle.addEventListener('click', function() {
                toggleSidebar();
            });

            // Close modals and notifications when clicking outside or pressing Escape
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    closeModal(e.target);
                }
                if (e.target.classList.contains('notification')) {
                    closeNotification(e.target);
                }
            });

            // Keyboard event listeners
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.modal');
                    if (modal) {
                        closeModal(modal);
                    }
                    const notification = document.querySelector('.notification');
                    if (notification) {
                        closeNotification(notification);
                    }
                }
            });

            // Handle window resize
            window.addEventListener('resize', debounce(setupResponsiveMenu, 250));
        }

        // Enhanced Keyboard Navigation
        function setupKeyboardNavigation() {
            // Trap focus in modals
            document.addEventListener('keydown', function(e) {
                const modal = document.querySelector('.modal');
                if (modal && e.key === 'Tab') {
                    trapFocus(modal, e);
                }
            });
        }

        function trapFocus(element, event) {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }

        // Enhanced responsive menu setup
        function setupResponsiveMenu() {
            if (window.innerWidth <= 1024) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
                sidebarOpen = false;
            } else {
                sidebar.classList.remove('collapsed', 'open');
                mainContent.classList.remove('expanded');
                sidebarOpen = true;
            }
        }

        // Enhanced sidebar toggle
        function toggleSidebar(force = null) {
            if (window.innerWidth <= 1024) {
                sidebarOpen = force !== null ? force : !sidebarOpen;
                sidebar.classList.toggle('open', sidebarOpen);
                sidebar.classList.toggle('collapsed', !sidebarOpen);
                mainContent.classList.toggle('expanded', !sidebarOpen);
                
                // Update ARIA attributes
                sidebar.setAttribute('aria-hidden', !sidebarOpen);
                menuToggle.setAttribute('aria-expanded', sidebarOpen);
                
                // Focus management
                if (sidebarOpen) {
                    const firstNavLink = sidebar.querySelector('.nav-link');
                    if (firstNavLink) firstNavLink.focus();
                }
            }
        }

        // Enhanced section showing
        function showSection(sectionId) {
            navLinks.forEach(link => {
                const isActive = link.getAttribute('data-section') === sectionId;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            });

            sections.forEach(section => {
                const isActive = section.id === sectionId;
                section.classList.toggle('active', isActive);
                section.setAttribute('aria-hidden', !isActive);
            });

            const titles = {
                'users': 'Manage Users',
                'candidates': 'Manage Candidates',
                'import': 'Import Data',
                'logs': 'Audit Logs',
                'analytics': 'Analytics'
            };
            pageTitle.textContent = titles[sectionId] || 'Admin Panel';

            if (currentSection !== sectionId) {
                currentSection = sectionId;
                loadSectionContent(sectionId);
                
                // Announce section change
                announceToScreenReader(`Switched to ${titles[sectionId]} section`);
            }
        }

// Initialize all sections
function initializeSections() {
    // Initialize candidates section if it exists
    const candidatesSection = document.getElementById('candidates');
    if (candidatesSection && !candidatesSection.dataset.initialized) {
        setupCandidatesSection();
        candidatesSection.dataset.initialized = 'true';
    }
}

// Load section content with enhanced error handling
function loadSectionContent(sectionId) {
    try {
        switch(sectionId) {
            case 'users':
                loadUsers();
                break;
            case 'candidates':
                loadCandidates();
                break;
            case 'import':
                setupImportForm();
                break;
            case 'logs':
                loadLogs();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            default:
                console.warn(`Unknown section: ${sectionId}`);
        }
    } catch (error) {
        console.error(`Error loading section ${sectionId}:`, error);
        showNotification(`Failed to load ${sectionId} section`, 'error');
    }
}

// Pagination state
let usersPagination = {
    currentPage: 0,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0,
    sortBy: 'id',
    sortDir: 'asc'
};

let candidatesPagination = {
    currentPage: 0,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0,
    sortBy: 'id',
    sortDir: 'asc'
};

// Enhanced User Management Functions with Pagination
function loadUsers(page = 0, size = 20) {
    const tableBody = document.querySelector('#users-table tbody');
    const tableContainer = document.querySelector('#users-table').closest('.table-container');
    
    if (!tableBody) {
        console.warn('Users table not found');
        return;
    }
    
    // Show loading overlay
    showLoadingOverlay(tableContainer);
    
    const params = new URLSearchParams({
        page: page,
        size: size,
        sortBy: usersPagination.sortBy,
        sortDir: usersPagination.sortDir
    });

    fetch(`${API_BASE_URL}/api/users/paginated?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        hideLoadingOverlay(tableContainer);
        
        // Update pagination state
        usersPagination.currentPage = data.currentPage;
        usersPagination.totalPages = data.totalPages;
        usersPagination.totalItems = data.totalItems;
        
        tableBody.innerHTML = '';
        
        if (!Array.isArray(data.users) || data.users.length === 0) {
            const colCount = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center">No users found</td></tr>`;
            updateUsersPaginationControls();
            return;
        }
        
        data.users.forEach((user, index) => {
            const statusClass = user.active ? 'status-success' : 'status-warning';
            const statusText = user.active ? 'Active' : 'Inactive';
            const actionText = user.active ? 'Deactivate' : 'Activate';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(user.id)}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.role)}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${user.id}" aria-label="Edit user ${user.username}">Edit</button>
                    <button class="btn btn-sm btn-danger deactivate-btn" data-id="${user.id}" aria-label="${actionText} user ${user.username}">
                        ${actionText}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attach event listeners
        attachUserActionListeners();
        
        // Update pagination controls
        updateUsersPaginationControls();
    })
    .catch(error => {
        hideLoadingOverlay(tableContainer);
        console.error('Error loading users:', error);
        setErrorState(tableBody, `Failed to load users: ${error.message}`);
        showNotification(`Failed to load users: ${error.message}`, 'error');
    });

    // Add create user button listener
    const createBtn = document.getElementById('create-user');
    if (createBtn && !createBtn.dataset.initialized) {
        createBtn.addEventListener('click', createUserModal);
        createBtn.dataset.initialized = 'true';
    }
}

        function attachUserActionListeners() {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editUser(btn.dataset.id));
            });
            document.querySelectorAll('.deactivate-btn').forEach(btn => {
                btn.addEventListener('click', () => toggleUserStatus(btn.dataset.id));
            });
        }

        // Loading overlay functions
        function showLoadingOverlay(container) {
            // Remove existing overlay
            const existingOverlay = container.querySelector('.loading-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            
            container.style.position = 'relative';
            container.appendChild(overlay);
        }

        function hideLoadingOverlay(container) {
            const overlay = container.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }

        // Users pagination controls
        function updateUsersPaginationControls() {
            const info = document.getElementById('users-info');
            const firstBtn = document.getElementById('users-first-page');
            const prevBtn = document.getElementById('users-prev-page');
            const nextBtn = document.getElementById('users-next-page');
            const lastBtn = document.getElementById('users-last-page');
            const pageNumbers = document.getElementById('users-page-numbers');
            const pageSizeSelect = document.getElementById('users-page-size');
            
            if (!info) return;
            
            // Update info
            const start = usersPagination.currentPage * usersPagination.pageSize + 1;
            const end = Math.min((usersPagination.currentPage + 1) * usersPagination.pageSize, usersPagination.totalItems);
            info.textContent = `Showing ${start} - ${end} of ${usersPagination.totalItems} users`;
            
            // Update buttons
            if (firstBtn) {
                firstBtn.disabled = usersPagination.currentPage === 0;
                firstBtn.onclick = () => loadUsers(0, usersPagination.pageSize);
            }
            
            if (prevBtn) {
                prevBtn.disabled = usersPagination.currentPage === 0;
                prevBtn.onclick = () => loadUsers(usersPagination.currentPage - 1, usersPagination.pageSize);
            }
            
            if (nextBtn) {
                nextBtn.disabled = usersPagination.currentPage >= usersPagination.totalPages - 1;
                nextBtn.onclick = () => loadUsers(usersPagination.currentPage + 1, usersPagination.pageSize);
            }
            
            if (lastBtn) {
                lastBtn.disabled = usersPagination.currentPage >= usersPagination.totalPages - 1;
                lastBtn.onclick = () => loadUsers(usersPagination.totalPages - 1, usersPagination.pageSize);
            }
            
            // Update page numbers
            if (pageNumbers) {
                pageNumbers.innerHTML = '';
                const maxVisiblePages = 5;
                let startPage = Math.max(0, usersPagination.currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(usersPagination.totalPages - 1, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(0, endPage - maxVisiblePages + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('span');
                    pageBtn.className = `page-number ${i === usersPagination.currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i + 1;
                    pageBtn.onclick = () => loadUsers(i, usersPagination.pageSize);
                    pageNumbers.appendChild(pageBtn);
                }
            }
            
            // Update page size select
            if (pageSizeSelect && !pageSizeSelect.dataset.initialized) {
                pageSizeSelect.value = usersPagination.pageSize;
                pageSizeSelect.onchange = (e) => {
                    usersPagination.pageSize = parseInt(e.target.value);
                    loadUsers(0, usersPagination.pageSize);
                };
                pageSizeSelect.dataset.initialized = 'true';
            }
        }

        // Candidates pagination controls
        function updateCandidatesPaginationControls() {
            const info = document.getElementById('candidates-info');
            const firstBtn = document.getElementById('candidates-first-page');
            const prevBtn = document.getElementById('candidates-prev-page');
            const nextBtn = document.getElementById('candidates-next-page');
            const lastBtn = document.getElementById('candidates-last-page');
            const pageNumbers = document.getElementById('candidates-page-numbers');
            const pageSizeSelect = document.getElementById('candidates-page-size');
            
            if (!info) return;
            
            // Update info
            const start = candidatesPagination.currentPage * candidatesPagination.pageSize + 1;
            const end = Math.min((candidatesPagination.currentPage + 1) * candidatesPagination.pageSize, candidatesPagination.totalItems);
            info.textContent = `Showing ${start} - ${end} of ${candidatesPagination.totalItems} candidates`;
            
            // Update buttons
            if (firstBtn) {
                firstBtn.disabled = candidatesPagination.currentPage === 0;
                firstBtn.onclick = () => loadCandidates(0, candidatesPagination.pageSize);
            }
            
            if (prevBtn) {
                prevBtn.disabled = candidatesPagination.currentPage === 0;
                prevBtn.onclick = () => loadCandidates(candidatesPagination.currentPage - 1, candidatesPagination.pageSize);
            }
            
            if (nextBtn) {
                nextBtn.disabled = candidatesPagination.currentPage >= candidatesPagination.totalPages - 1;
                nextBtn.onclick = () => loadCandidates(candidatesPagination.currentPage + 1, candidatesPagination.pageSize);
            }
            
            if (lastBtn) {
                lastBtn.disabled = candidatesPagination.currentPage >= candidatesPagination.totalPages - 1;
                lastBtn.onclick = () => loadCandidates(candidatesPagination.totalPages - 1, candidatesPagination.pageSize);
            }
            
            // Update page numbers
            if (pageNumbers) {
                pageNumbers.innerHTML = '';
                const maxVisiblePages = 5;
                let startPage = Math.max(0, candidatesPagination.currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(candidatesPagination.totalPages - 1, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(0, endPage - maxVisiblePages + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('span');
                    pageBtn.className = `page-number ${i === candidatesPagination.currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i + 1;
                    pageBtn.onclick = () => loadCandidates(i, candidatesPagination.pageSize);
                    pageNumbers.appendChild(pageBtn);
                }
            }
            
            // Update page size select
            if (pageSizeSelect && !pageSizeSelect.dataset.initialized) {
                pageSizeSelect.value = candidatesPagination.pageSize;
                pageSizeSelect.onchange = (e) => {
                    candidatesPagination.pageSize = parseInt(e.target.value);
                    loadCandidates(0, candidatesPagination.pageSize);
                };
                pageSizeSelect.dataset.initialized = 'true';
            }
        }

        // Enhanced modal creation with better accessibility
        function createUserModal() {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'modal-title');
            modal.setAttribute('aria-modal', 'true');
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title" id="modal-title">Create New User</h2>
                    </div>
                    <form id="create-user-form" class="form" novalidate>
                        <div class="form-group">
                            <label class="form-label" for="username">Username:</label>
                            <input type="text" id="username" class="form-input" required minlength="3" maxlength="50">
                            <div class="error-message" id="username-error" role="alert"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="email">Email:</label>
                            <input type="email" id="email" class="form-input" required>
                            <div class="error-message" id="email-error" role="alert"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="role">Role:</label>
                            <select id="role" class="form-select" required>
                                <option value="">Select Role</option>
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                            </select>
                            <div class="error-message" id="role-error" role="alert"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="password">Password:</label>
                            <input type="password" id="password" class="form-input" required minlength="8">
                            <div class="error-message" id="password-error" role="alert"></div>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="loading hidden" aria-hidden="true"></span>
                                Create User
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            const form = modal.querySelector('#create-user-form');
            const cancelBtn = modal.querySelector('.cancel-btn');
            const submitBtn = form.querySelector('button[type="submit"]');
            const loading = submitBtn.querySelector('.loading');

            // Focus the first input
            setTimeout(() => {
                const firstInput = form.querySelector('#username');
                if (firstInput) firstInput.focus();
            }, 100);

            cancelBtn.addEventListener('click', () => closeModal(modal));

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!validateForm(form)) {
                    return;
                }
                
                setButtonLoading(submitBtn, loading, true);

                const userData = {
                    username: form.querySelector('#username').value.trim(),
                    email: form.querySelector('#email').value.trim(),
                    role: form.querySelector('#role').value,
                    password: form.querySelector('#password').value
                };

                try {
                    const response = await fetch(`${API_BASE_URL}/api/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                    
                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to create user');
                    }
                    
                    showNotification('User created successfully!', 'success');
                    closeModal(modal);
                    loadUsers();
                } catch (error) {
                    console.error('Error creating user:', error);
                    showNotification(`Failed to create user: ${error.message}`, 'error');
                } finally {
                    setButtonLoading(submitBtn, loading, false);
                }
            });
        }

        // Enhanced edit user function
        async function editUser(id) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) throw new Error('Failed to fetch user data');
                const userData = await response.json();

                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-labelledby', 'edit-modal-title');
                modal.setAttribute('aria-modal', 'true');
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title" id="edit-modal-title">Edit User</h2>
                        </div>
                        <form id="edit-user-form" class="form" novalidate>
                            <div class="form-group">
                                <label class="form-label" for="edit-username">Username:</label>
                                <input type="text" id="edit-username" class="form-input" value="${escapeHtml(userData.username)}" required minlength="3" maxlength="50">
                                <div class="error-message" id="edit-username-error" role="alert"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-email">Email:</label>
                                <input type="email" id="edit-email" class="form-input" value="${escapeHtml(userData.email)}" required>
                                <div class="error-message" id="edit-email-error" role="alert"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-role">Role:</label>
                                <select id="edit-role" class="form-select" required>
                                    <option value="ADMIN" ${userData.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                                    <option value="USER" ${userData.role === 'USER' ? 'selected' : ''}>User</option>
                                </select>
                                <div class="error-message" id="edit-role-error" role="alert"></div>
                            </div>
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <span class="loading hidden" aria-hidden="true"></span>
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                `;
                document.body.appendChild(modal);

                const form = modal.querySelector('#edit-user-form');
                const cancelBtn = modal.querySelector('.cancel-btn');
                const submitBtn = form.querySelector('button[type="submit"]');
                const loading = submitBtn.querySelector('.loading');

                // Focus the first input
                setTimeout(() => {
                    const firstInput = form.querySelector('#edit-username');
                    if (firstInput) firstInput.focus();
                }, 100);

                cancelBtn.addEventListener('click', () => closeModal(modal));

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    if (!validateForm(form)) {
                        return;
                    }
                    
                    setButtonLoading(submitBtn, loading, true);

                    const updateData = {
                        username: form.querySelector('#edit-username').value.trim(),
                        email: form.querySelector('#edit-email').value.trim(),
                        role: form.querySelector('#edit-role').value
                    };

                    try {
                        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updateData)
                        });
                        
                        if (!response.ok) {
                            let errorMessage = 'Failed to update user';
                            try {
                                const error = await response.json();
                                if (error.message) {
                                    errorMessage = error.message;
                                } else if (error.errors && Array.isArray(error.errors)) {
                                    // Handle validation errors
                                    errorMessage = error.errors.map(err => err.defaultMessage || err.message).join(', ');
                                }
                            } catch (e) {
                                // If response is not JSON, use status text
                                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                            }
                            throw new Error(errorMessage);
                        }
                        
                        showNotification('User updated successfully!', 'success');
                        closeModal(modal);
                        loadUsers();
                    } catch (error) {
                        console.error('Error updating user:', error);
                        showNotification(`Failed to update user: ${error.message}`, 'error');
                    } finally {
                        setButtonLoading(submitBtn, loading, false);
                    }
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                showNotification(`Failed to load user data: ${error.message}`, 'error');
            }
        }

        // Enhanced deactivate user function
		async function toggleUserStatus(id) {
		    console.log('toggleUserStatus called with id:', id);
		    const btn = document.querySelector(`.deactivate-btn[data-id="${id}"]`);
		    
		    if (!btn) {
		        console.error('Button not found for id:', id);
		        return;
		    }
		    
		    const action = btn.textContent.trim();
		    console.log('Action:', action);
		    
		    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this user?`)) {
		        return;
		    }

		    const originalText = btn.textContent;
		    btn.disabled = true;
		    btn.textContent = 'Processing...';

		    try {
		        const url = `${API_BASE_URL}/api/users/${id}/toggle-status`;
		        console.log('Making API call to:', url);
		        
		        const response = await fetch(url, {
		            method: 'PUT',
		            headers: { 'Content-Type': 'application/json' }
		        });
		        
		        if (!response.ok) {
		            const error = await response.text();
		            console.error(`HTTP ${response.status}: ${response.statusText}`, error);
		            throw new Error(error || `Failed to update user status (HTTP ${response.status})`);
		        }
		        
		        const message = await response.text();
		        showNotification(message, 'success');
		        loadUsers();
		    } catch (error) {
		        console.error('Error updating user status:', error);
		        showNotification(`Failed to update user status: ${error.message}`, 'error');
		        btn.textContent = originalText;
		        btn.disabled = false;
		    }
		}

// Enhanced Candidate Management Functions
function setupCandidatesSection() {
    const createBtn = document.getElementById('create-candidate');
    if (createBtn && !createBtn.dataset.initialized) {
        createBtn.addEventListener('click', createCandidateModal);
        createBtn.dataset.initialized = 'true';
    }
}

function loadCandidates(page = 0, size = 20) {
    const tableBody = document.querySelector('#candidates-table tbody');
    const tableContainer = document.querySelector('#candidates-table').closest('.table-container');
    
    if (!tableBody) {
        console.warn('Candidates table not found');
        return;
    }
    
    // Show loading overlay
    showLoadingOverlay(tableContainer);
    
    const params = new URLSearchParams({
        page: page,
        size: size,
        sortBy: candidatesPagination.sortBy,
        sortDir: candidatesPagination.sortDir
    });

    fetch(`${API_BASE_URL}/api/candidates/paginated?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        hideLoadingOverlay(tableContainer);
        
        // Update pagination state
        candidatesPagination.currentPage = data.currentPage;
        candidatesPagination.totalPages = data.totalPages;
        candidatesPagination.totalItems = data.totalItems;
        
        tableBody.innerHTML = '';
        
        if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
            const colCount = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center">No candidates found</td></tr>`;
            updateCandidatesPaginationControls();
            return;
        }
        
        data.candidates.forEach((candidate, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(candidate.id)}</td>
                <td>${escapeHtml(candidate.name || 'N/A')}</td>
                <td>${escapeHtml(candidate.email || 'N/A')}</td>
                <td>${escapeHtml(candidate.phone || 'N/A')}</td>
                <td>${escapeHtml(candidate.skills || 'N/A')}</td>
                <td>${escapeHtml(candidate.experience || 'N/A')}</td>
                <td>${escapeHtml(candidate.source || 'N/A')}</td>
                <td>
                    <button class="btn btn-sm btn-secondary edit-candidate-btn" data-id="${candidate.id}" aria-label="Edit candidate ${candidate.name}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-candidate-btn" data-id="${candidate.id}" aria-label="Delete candidate ${candidate.name}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attach event listeners
        attachCandidateActionListeners();
        
        // Update pagination controls
        updateCandidatesPaginationControls();
    })
    .catch(error => {
        hideLoadingOverlay(tableContainer);
        console.error('Error loading candidates:', error);
        setErrorState(tableBody, `Failed to load candidates: ${error.message}`);
        showNotification(`Failed to load candidates: ${error.message}`, 'error');
    });
}

function attachCandidateActionListeners() {
    document.querySelectorAll('.edit-candidate-btn').forEach(btn => {
        btn.addEventListener('click', () => editCandidate(btn.dataset.id));
    });
    document.querySelectorAll('.delete-candidate-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCandidate(btn.dataset.id));
    });
}

function createCandidateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'candidate-modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="candidate-modal-title">Create New Candidate</h2>
            </div>
            <form id="create-candidate-form" class="form" novalidate>
                <div class="form-group">
                    <label class="form-label" for="candidate-name">Name:</label>
                    <input type="text" id="candidate-name" class="form-input" required>
                    <div class="error-message" id="candidate-name-error" role="alert"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="candidate-email">Email:</label>
                    <input type="email" id="candidate-email" class="form-input" required>
                    <div class="error-message" id="candidate-email-error" role="alert"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="candidate-phone">Phone:</label>
                    <input type="tel" id="candidate-phone" class="form-input">
                    <div class="error-message" id="candidate-phone-error" role="alert"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="candidate-skills">Skills:</label>
                    <textarea id="candidate-skills" class="form-input" rows="3"></textarea>
                    <div class="error-message" id="candidate-skills-error" role="alert"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="candidate-experience">Experience:</label>
                    <textarea id="candidate-experience" class="form-input" rows="3"></textarea>
                    <div class="error-message" id="candidate-experience-error" role="alert"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="candidate-source">Source:</label>
                    <select id="candidate-source" class="form-select" required>
                        <option value="">Select Source</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Indeed">Indeed</option>
                        <option value="Company Website">Company Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Other">Other</option>
                    </select>
                    <div class="error-message" id="candidate-source-error" role="alert"></div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <span class="loading hidden" aria-hidden="true"></span>
                        Create Candidate
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#create-candidate-form');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = submitBtn.querySelector('.loading');

    // Focus the first input
    setTimeout(() => {
        const firstInput = form.querySelector('#candidate-name');
        if (firstInput) firstInput.focus();
    }, 100);

    cancelBtn.addEventListener('click', () => closeModal(modal));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm(form)) {
            return;
        }
        
        setButtonLoading(submitBtn, loading, true);

        const candidateData = {
            name: form.querySelector('#candidate-name').value.trim(),
            email: form.querySelector('#candidate-email').value.trim(),
            phone: form.querySelector('#candidate-phone').value.trim(),
            skills: form.querySelector('#candidate-skills').value.trim(),
            experience: form.querySelector('#candidate-experience').value.trim(),
            source: form.querySelector('#candidate-source').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidateData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create candidate');
            }
            
            showNotification('Candidate created successfully!', 'success');
            closeModal(modal);
            loadCandidates();
        } catch (error) {
            console.error('Error creating candidate:', error);
            showNotification(`Failed to create candidate: ${error.message}`, 'error');
        } finally {
            setButtonLoading(submitBtn, loading, false);
        }
    });
}

async function editCandidate(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to fetch candidate data');
        const candidateData = await response.json();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'edit-candidate-modal-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="edit-candidate-modal-title">Edit Candidate</h2>
                </div>
                <form id="edit-candidate-form" class="form" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-name">Name:</label>
                        <input type="text" id="edit-candidate-name" class="form-input" value="${escapeHtml(candidateData.name || '')}" required>
                        <div class="error-message" id="edit-candidate-name-error" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-email">Email:</label>
                        <input type="email" id="edit-candidate-email" class="form-input" value="${escapeHtml(candidateData.email || '')}" required>
                        <div class="error-message" id="edit-candidate-email-error" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-phone">Phone:</label>
                        <input type="tel" id="edit-candidate-phone" class="form-input" value="${escapeHtml(candidateData.phone || '')}">
                        <div class="error-message" id="edit-candidate-phone-error" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-skills">Skills:</label>
                        <textarea id="edit-candidate-skills" class="form-input" rows="3">${escapeHtml(candidateData.skills || '')}</textarea>
                        <div class="error-message" id="edit-candidate-skills-error" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-experience">Experience:</label>
                        <textarea id="edit-candidate-experience" class="form-input" rows="3">${escapeHtml(candidateData.experience || '')}</textarea>
                        <div class="error-message" id="edit-candidate-experience-error" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="edit-candidate-source">Source:</label>
                        <select id="edit-candidate-source" class="form-select" required>
                            <option value="">Select Source</option>
                            <option value="LinkedIn" ${candidateData.source === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                            <option value="Indeed" ${candidateData.source === 'Indeed' ? 'selected' : ''}>Indeed</option>
                            <option value="Company Website" ${candidateData.source === 'Company Website' ? 'selected' : ''}>Company Website</option>
                            <option value="Referral" ${candidateData.source === 'Referral' ? 'selected' : ''}>Referral</option>
                            <option value="Other" ${candidateData.source === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                        <div class="error-message" id="edit-candidate-source-error" role="alert"></div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="loading hidden" aria-hidden="true"></span>
                            Update Candidate
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        const form = modal.querySelector('#edit-candidate-form');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const submitBtn = form.querySelector('button[type="submit"]');
        const loading = submitBtn.querySelector('.loading');

        // Focus the first input
        setTimeout(() => {
            const firstInput = form.querySelector('#edit-candidate-name');
            if (firstInput) firstInput.focus();
        }, 100);

        cancelBtn.addEventListener('click', () => closeModal(modal));

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm(form)) {
                return;
            }
            
            setButtonLoading(submitBtn, loading, true);

            const updateData = {
                name: form.querySelector('#edit-candidate-name').value.trim(),
                email: form.querySelector('#edit-candidate-email').value.trim(),
                phone: form.querySelector('#edit-candidate-phone').value.trim(),
                skills: form.querySelector('#edit-candidate-skills').value.trim(),
                experience: form.querySelector('#edit-candidate-experience').value.trim(),
                source: form.querySelector('#edit-candidate-source').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update candidate');
                }
                
                showNotification('Candidate updated successfully!', 'success');
                closeModal(modal);
                loadCandidates();
            } catch (error) {
                console.error('Error updating candidate:', error);
                showNotification(`Failed to update candidate: ${error.message}`, 'error');
            } finally {
                setButtonLoading(submitBtn, loading, false);
            }
        });
    } catch (error) {
        console.error('Error fetching candidate:', error);
        showNotification(`Failed to load candidate data: ${error.message}`, 'error');
    }
}

async function deleteCandidate(id) {
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete candidate');
        }
        
        showNotification('Candidate deleted successfully!', 'success');
        loadCandidates();
    } catch (error) {
        console.error('Error deleting candidate:', error);
        showNotification(`Failed to delete candidate: ${error.message}`, 'error');
    }
}

// Enhanced Import Functions
        function setupImportForm() {
            const form = document.getElementById('import-form');
            if (form && !form.dataset.initialized) {
                form.addEventListener('submit', handleImport);
                form.dataset.initialized = 'true';
                
                // Add file validation
                const fileInput = document.getElementById('file-upload');
                fileInput.addEventListener('change', validateFileInput);
            }
        }

        function validateFileInput(e) {
            const file = e.target.files[0];
            const statusDiv = document.getElementById('import-status');
            
            if (!file) return;
            
            const validExtensions = ['.csv', '.xlsx', '.xls', '.txt'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validExtensions.includes(fileExtension)) {
                statusDiv.innerHTML = '<div class="status status-error">Only CSV, Excel (.xlsx, .xls), or Text (.txt) files are allowed.</div>';
                e.target.value = '';
                return;
            }
            
            if (file.size > maxSize) {
                statusDiv.innerHTML = '<div class="status status-error">File size must be less than 10MB.</div>';
                e.target.value = '';
                return;
            }
            
            statusDiv.innerHTML = '';
        }

        async function handleImport(e) {
            e.preventDefault();

            const fileInput = document.getElementById('file-upload');
            const source = document.getElementById('source').value;
            const file = fileInput.files[0];
            const statusDiv = document.getElementById('import-status');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const loading = submitBtn.querySelector('.loading');

            // Clear previous status
            statusDiv.innerHTML = '';

            if (!validateImportForm(file, source, statusDiv)) {
                return;
            }

            setButtonLoading(submitBtn, loading, true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('source', source);

            try {
                const response = await fetch(`${API_BASE_URL}/api/candidates/import`, {
                    method: 'POST',
                    body: formData
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
                }

                statusDiv.innerHTML = `<div class="status status-success">Import successful! ${responseData.importedCount || 0} candidates imported from ${source}.</div>`;
                e.target.reset();
                showNotification(`Candidates imported successfully! ${responseData.importedCount || 0} candidates added.`, 'success');
                
                // Refresh candidates table and analytics after import
                if (currentSection === 'candidates') {
                    loadCandidates(0, candidatesPagination.pageSize);
                }
                
                // Force refresh analytics to show updated counts
                loadAnalytics(true);
                
                // Announce success to screen readers
                announceToScreenReader(`Import completed successfully. ${responseData.importedCount || 0} candidates imported.`);
            } catch (error) {
                console.error('Error importing data:', error);
                statusDiv.innerHTML = `<div class="status status-error">Failed to import data: ${error.message}</div>`;
                showNotification(`Failed to import data: ${error.message}`, 'error');
            } finally {
                setButtonLoading(submitBtn, loading, false);
            }
        }

        function validateImportForm(file, source, statusDiv) {
            if (!file || !source) {
                statusDiv.innerHTML = '<div class="status status-error">Please select both a file and source before importing.</div>';
                return false;
            }

            const validExtensions = ['.csv', '.xlsx', '.xls', '.txt'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!validExtensions.includes(fileExtension)) {
                statusDiv.innerHTML = '<div class="status status-error">Only CSV, Excel (.xlsx, .xls), or Text (.txt) files are allowed.</div>';
                return false;
            }

            return true;
        }

        // Enhanced Logs Functions
        function loadLogs() {
            const filterBtn = document.getElementById('filter-logs');
            if (filterBtn && !filterBtn.dataset.initialized) {
                filterBtn.addEventListener('click', fetchLogs);
                filterBtn.dataset.initialized = 'true';
                
                // Set default date range (last 7 days)
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                document.getElementById('date-to').value = today.toISOString().split('T')[0];
                document.getElementById('date-from').value = weekAgo.toISOString().split('T')[0];
            }
            fetchLogs();
        }

        async function fetchLogs() {
            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            const tableBody = document.querySelector('#logs-table tbody');
            const filterBtn = document.getElementById('filter-logs');
            const loading = filterBtn.querySelector('.loading');

            const formattedFrom = dateFrom ? `${dateFrom}T00:00:00` : null;
            const formattedTo = dateTo ? `${dateTo}T23:59:59` : null;
            const queryParams = [];
            
            if (formattedFrom) queryParams.push(`from=${encodeURIComponent(formattedFrom)}`);
            if (formattedTo) queryParams.push(`to=${encodeURIComponent(formattedTo)}`);
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            setLoadingState(tableBody, 'Loading logs...');
            setButtonLoading(filterBtn, loading, true);

            try {
                const response = await fetch(`${API_BASE_URL}/api/audit-logs${queryString}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP error! Status: ${response.status}`);
                }
                
                const logs = await response.json();
                tableBody.innerHTML = '';

                if (!Array.isArray(logs) || logs.length === 0) {
                    const colCount = tableBody.closest('table').querySelectorAll('thead th').length;
                    tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center">No logs found for the selected date range</td></tr>`;
                    return;
                }

                logs.forEach(log => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${new Date(log.timestamp).toLocaleString()}</td>
                        <td>${escapeHtml(log.user)}</td>
                        <td><span class="status status-success">${escapeHtml(log.action)}</span></td>
                        <td>${escapeHtml(log.details)}</td>
                    `;
                    tableBody.appendChild(row);
                });
                
                announceToScreenReader(`Loaded ${logs.length} log entries`);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setErrorState(tableBody, `Failed to load logs: ${error.message}`);
                showNotification(`Failed to load logs: ${error.message}`, 'error');
            } finally {
                setButtonLoading(filterBtn, loading, false);
            }
        }

        // Enhanced Analytics Functions with Caching
        let analyticsCache = null;
        let analyticsCacheTime = 0;
        const ANALYTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        async function loadAnalytics(forceRefresh = false) {
            const chartContainer = document.getElementById('chart-container');
            const now = Date.now();
            
            // Use cached data if available and not expired
            if (!forceRefresh && analyticsCache && (now - analyticsCacheTime) < ANALYTICS_CACHE_DURATION) {
                updateMetricCards(analyticsCache);
                renderCharts(analyticsCache);
                return;
            }
            
            // Show loading with overlay
            if (chartContainer) {
                showLoadingOverlay(chartContainer);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/analytics`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) throw new Error('Failed to load analytics data');
                const data = await response.json();
                
                // Cache the data
                analyticsCache = data;
                analyticsCacheTime = now;
                
                hideLoadingOverlay(chartContainer);
                updateMetricCards(data);
                renderCharts(data);
                announceToScreenReader('Analytics data loaded successfully');
            } catch (error) {
                console.error('Error loading analytics:', error);
                hideLoadingOverlay(chartContainer);
                if (chartContainer) {
                    chartContainer.innerHTML = `<div class="text-center status status-error">Error: ${error.message}</div>`;
                }
                showNotification(`Failed to load analytics: ${error.message}`, 'error');
            }
        }

        function updateMetricCards(data) {
            const cards = [
                { id: 'total-users', value: data.totalUsers || 0, label: 'Total Users' },
                { id: 'active-users', value: data.activeUsers || 0, label: 'Active Users' },
                { id: 'total-candidates', value: data.totalCandidates ? data.totalCandidates.toLocaleString() : 0, label: 'Total Candidates' },
                { id: 'imports-last-30-days', value: data.importsLast30Days ? data.importsLast30Days.toLocaleString() : 0, label: 'Imports (Last 30 Days)' }
            ];

            cards.forEach(card => {
                const element = document.getElementById(card.id);
                if (element) {
                    const valueElement = element.querySelector('.metric-value');
                    if (valueElement) {
                        animateValue(valueElement, 0, parseInt(card.value.toString().replace(/,/g, '')) || 0, 1000);
                        valueElement.setAttribute('aria-label', `${card.label}: ${card.value}`);
                    }
                }
            });
        }

        function animateValue(element, start, end, duration) {
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(start + (end - start) * progress);
                element.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }

        function renderCharts(data) {
            const chartContainer = document.getElementById('chart-container');
            chartContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                    <svg width="64" height="64" fill="var(--accent-color)" viewBox="0 0 24 24" style="margin-bottom: 1rem;" aria-hidden="true">
                        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                    </svg>
                    <p>📊 Charts will be rendered here when connected to real data</p>
                    <p style="font-size: 0.875rem; opacity: 0.7;">Connect your analytics service to see detailed charts and graphs</p>
                </div>
            `;
        }

        // Enhanced Utility Functions
        function showNotification(message, type = 'info') {
            // Remove any existing notifications to prevent overlap
            document.querySelectorAll('.notification').forEach(n => closeNotification(n));

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'assertive');

            document.body.appendChild(notification);

            // Auto-close after 4 seconds
            setTimeout(() => {
                closeNotification(notification);
            }, 4000);
        }

        function closeModal(modal) {
            modal.style.animation = 'popupOut 0.3s ease forwards';
            setTimeout(() => modal.remove(), 300);
            
            // Return focus to the trigger element if possible
            const createBtn = document.getElementById('create-user');
            if (createBtn) createBtn.focus();
        }

        function closeNotification(notification) {
            notification.style.animation = 'popupOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }

        function setLoadingState(tableBody, message) {
            const colCount = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center"><div class="loading"></div> ${message}</td></tr>`;
        }

        function setErrorState(tableBody, message) {
            const colCount = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center status status-error">${message}</td></tr>`;
        }

        function setButtonLoading(button, loadingElement, isLoading) {
            button.disabled = isLoading;
            if (loadingElement) {
                loadingElement.classList.toggle('hidden', !isLoading);
            }
        }

        function validateForm(form) {
            const inputs = form.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                const errorElement = form.querySelector(`#${input.id}-error`);
                let error = '';

                if (!input.value.trim()) {
                    error = 'This field is required';
                    isValid = false;
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    error = 'Please enter a valid email address';
                    isValid = false;
                } else if (input.minLength && input.value.length < input.minLength) {
                    error = `Minimum length is ${input.minLength} characters`;
                    isValid = false;
                }

                if (errorElement) {
                    errorElement.textContent = error;
                    errorElement.style.color = error ? 'var(--danger-color)' : '';
                }

                input.classList.toggle('error', !!error);
                input.setAttribute('aria-invalid', !!error);
            });

            return isValid;
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }