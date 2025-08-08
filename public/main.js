(function() {
  const rootHtml = document.documentElement;
  const themeToggleButton = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const pageTitle = document.getElementById('pageTitle');

  // Resolve initial theme from localStorage or system preference
  const savedTheme = localStorage.getItem('ui.theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  // Toggle theme on click
  themeToggleButton?.addEventListener('click', () => {
    const nextTheme = rootHtml.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    rootHtml.setAttribute('data-theme', theme);
    localStorage.setItem('ui.theme', theme);
    const isDark = theme === 'dark';
    themeToggleButton?.setAttribute('aria-pressed', String(isDark));
    // icon swap: show sun in dark mode (to switch to light), show moon in light mode
    if (isDark) {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }

  // Sidebar open/close for mobile
  menuToggle?.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Section navigation handling
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = new Map(
    Array.from(document.querySelectorAll('.section')).map((el) => [el.id, el])
  );

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      if (!target || !sections.has(target)) return;

      // update active link
      navLinks.forEach((l) => l.classList.toggle('active', l === link));

      // show section
      sections.forEach((sectionEl, id) => {
        const isActive = id === target;
        sectionEl.classList.toggle('active', isActive);
      });

      // update page title
      pageTitle.textContent = link.textContent.trim();

      // close sidebar on mobile
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Example: populate dummy table rows for visual testing
  function populateDummyRows() {
    const usersTbody = document.querySelector('#users-table tbody');
    const candidatesTbody = document.querySelector('#candidates-table tbody');
    if (usersTbody && usersTbody.children.length === 0) {
      for (let i = 1; i <= 5; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${i}</td>
          <td>user${i}</td>
          <td>user${i}@example.com</td>
          <td>${i % 2 === 0 ? 'Editor' : 'Admin'}</td>
          <td><span class="status ${i % 2 === 0 ? 'status-success' : 'status-warning'}">${i % 2 === 0 ? 'Active' : 'Pending'}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary">Edit</button>
            <button class="btn btn-sm btn-danger">Delete</button>
          </td>`;
        usersTbody.appendChild(tr);
      }
    }
    if (candidatesTbody && candidatesTbody.children.length === 0) {
      for (let i = 1; i <= 5; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${i}</td>
          <td>Candidate ${i}</td>
          <td>candidate${i}@mail.com</td>
          <td>+1-202-555-01${(10 + i).toString().slice(-2)}</td>
          <td>React, Node</td>
          <td>${1 + i} yrs</td>
          <td>${i % 2 === 0 ? 'LinkedIn' : 'Naukri'}</td>
          <td>
            <button class="btn btn-sm btn-secondary">Open</button>
            <button class="btn btn-sm btn-success">Shortlist</button>
          </td>`;
        candidatesTbody.appendChild(tr);
      }
    }
  }
  populateDummyRows();

  // Import form basic UX
  const importForm = document.getElementById('import-form');
  const importStatus = document.getElementById('import-status');
  importForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = importForm.querySelector('button[type="submit"]');
    const spinner = submitBtn?.querySelector('.loading');
    submitBtn.disabled = true;
    spinner?.classList.remove('hidden');
    importStatus.textContent = '';
    setTimeout(() => {
      submitBtn.disabled = false;
      spinner?.classList.add('hidden');
      importStatus.innerHTML = '<div class="notification notification-success">Import completed successfully (demo)</div>';
      setTimeout(() => (importStatus.innerHTML = ''), 2200);
    }, 1200);
  });
})();