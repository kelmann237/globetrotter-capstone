/* ============================================
   CONFIGURATION
   ============================================ */
const API_BASE = 'http://127.0.0.1:5000';

/* ============================================
   ÉTAT GLOBAL
   ============================================ */
let allDestinations = [];
let currentView = 'destinations';

/* ============================================
   UTILITAIRES & SÉCURITÉ
   ============================================ */
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(elementId, message, type = 'error') {
    const el = $(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `form-message ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'form-message'; }, 5000);
}

function getToken() {
    return localStorage.getItem('access_token');
}

function setToken(token) {
    if (token) {
        localStorage.setItem('access_token', token);
    } else {
        localStorage.removeItem('access_token');
    }
}

/**
 * Vérifie si l'utilisateur est authentifié et si le token n'est pas expiré.
 */
function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return false;
        const payload = JSON.parse(atob(payloadBase64));
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            setToken(null);
            return false;
        }
        return true;
    } catch (e) {
        setToken(null);
        return false;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getBudgetLabel(level) {
    const map = { low: '$', medium: '$$', high: '$$$' };
    return map[level] || level;
}

function getBudgetClass(level) {
    const map = { low: 'budget-low', medium: 'budget-medium', high: 'budget-high' };
    return map[level] || 'budget-default';
}

/* ============================================
   GESTION DES VUES (SPA)
   ============================================ */
function showView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    
    const view = $(`#${viewId}-view`);
    if (view) view.classList.add('active');

    $$('.nav-link').forEach(link => link.classList.remove('active'));
    const navLink = $(`.nav-link[data-view="${viewId}"]`);
    if (navLink) navLink.classList.add('active');

    $('#nav-links')?.classList.remove('open');

    currentView = viewId;

    if (viewId === 'destinations') {
        loadDestinations();
    } else if (viewId === 'itineraries') {
        if (!isAuthenticated()) {
            showView('auth');
            showMessage('login-message', 'Veuillez vous connecter pour accéder à vos itinéraires.', 'error');
            return;
        }
        loadItineraries();
        loadDestinationsIntoSelect();
    } else if (viewId === 'recommendations') {
        const results = $('#recommendations-results');
        if (results) results.innerHTML = '';
    }
}

function updateNavbar() {
    const authLink = $('#nav-auth');
    const logoutLink = $('#nav-logout');

    if (isAuthenticated()) {
        if (authLink) authLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (authLink) authLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

/* ============================================
   API HELPERS
   ============================================ */
async function apiGet(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { method: 'GET', headers });
    return handleResponse(response);
}

async function apiPost(endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    return handleResponse(response);
}

async function handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Extraction prioritaire de la clé 'error' envoyée par votre Python
        const errorMsg = data.error || data.message || `Erreur ${response.status}`;

        if (response.status === 401) {
            setToken(null);
            updateNavbar();
            showView('auth');
            throw new Error(errorMsg || 'Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorMsg);
    }
    return data;
}

/* ============================================
   AUTHENTIFICATION
   ============================================ */
async function handleRegister(e) {
    e.preventDefault();
    const name = $('#register-name')?.value.trim() || '';
    const email = $('#register-email')?.value.trim() || '';
    const password = $('#register-password')?.value || '';
    const rawPreferences = $('#register-preferences')?.value.trim() || '';

    // Découpage propre des préférences sous forme de tableau ou chaîne
    const preferences = rawPreferences ? rawPreferences.split(',').map(p => p.trim()) : [];

    if (!email || !password) {
        showMessage('register-message', 'L\'email et le mot de passe sont obligatoires.', 'error');
        return;
    }

    try {
        // Envoi vers /register (ou /auth/register si vous utilisez url_prefix)
        await apiPost('/register', { name, email, password, preferences });
        showMessage('register-message', 'Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
        $('#register-form').reset();
        setTimeout(() => switchAuthTab('login'), 1200);
    } catch (err) {
        showMessage('register-message', err.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = $('#login-email')?.value.trim() || '';
    const password = $('#login-password')?.value || '';

    if (!email || !password) {
        showMessage('login-message', 'L\'email et le mot de passe sont obligatoires.', 'error');
        return;
    }

    try {
        const data = await apiPost('/login', { email, password });
        if (data.access_token) {
            setToken(data.access_token);
            updateNavbar();
            showMessage('login-message', 'Connexion réussie !', 'success');
            $('#login-form').reset();
            setTimeout(() => showView('destinations'), 800);
        } else {
            throw new Error('Jeton de connexion manquant dans la réponse.');
        }
    } catch (err) {
        showMessage('login-message', err.message, 'error');
    }
}

function logout() {
    setToken(null);
    updateNavbar();
    showView('destinations');
    $('#login-form')?.reset();
    $('#register-form')?.reset();
    $('#itinerary-form')?.reset();
}

function switchAuthTab(tab) {
    $$('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'login') {
        if ($('#login-form')) $('#login-form').style.display = 'block';
        if ($('#register-form')) $('#register-form').style.display = 'none';
    } else {
        if ($('#login-form')) $('#login-form').style.display = 'none';
        if ($('#register-form')) $('#register-form').style.display = 'block';
    }
}

/* ============================================
   DESTINATIONS
   ============================================ */
async function loadDestinations() {
    const grid = $('#destinations-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-spinner">Chargement des destinations...</div>';

    try {
        const data = await apiGet('/destinations');
        allDestinations = Array.isArray(data) ? data : (data.destinations || []);
        renderDestinations(allDestinations);
    } catch (err) {
        grid.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
}

function renderDestinations(destinations) {
    const grid = $('#destinations-grid');
    if (!grid) return;

    if (!destinations || destinations.length === 0) {
        grid.innerHTML = '<div class="alert alert-info">Aucune destination ne correspond à vos critères.</div>';
        return;
    }

    grid.innerHTML = destinations.map(dest => `
        <article class="card">
            <div class="card-image">🌍</div>
            <div class="card-body">
                <div class="card-header-row">
                    <h3 class="card-title">${escapeHtml(dest.name)}</h3>
                    <span class="badge ${getBudgetClass(dest.budget)}">${escapeHtml(getBudgetLabel(dest.budget))}</span>
                </div>
                <p class="card-country">${escapeHtml(dest.country || '')}</p>
                <p class="card-description">${escapeHtml(dest.description || 'Aucune description disponible.')}</p>
                <div class="card-tags">
                    ${(dest.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                </div>
                <span class="badge badge-region">${escapeHtml(dest.region || 'Inconnu')}</span>
            </div>
        </article>
    `).join('');
}

function filterDestinations() {
    const search = $('#dest-search')?.value.toLowerCase().trim() || '';
    const region = $('#dest-region-filter')?.value || '';
    const budget = $('#dest-budget-filter')?.value || '';

    const filtered = allDestinations.filter(dest => {
        const matchSearch = !search ||
            (dest.name && dest.name.toLowerCase().includes(search)) ||
            (dest.country && dest.country.toLowerCase().includes(search)) ||
            (dest.description && dest.description.toLowerCase().includes(search));
        const matchRegion = !region || (dest.region && dest.region.toLowerCase() === region.toLowerCase());
        const matchBudget = !budget || (dest.budget === budget);
        return matchSearch && matchRegion && matchBudget;
    });

    renderDestinations(filtered);
}

/* ============================================
   RECOMMANDATIONS
   ============================================ */
async function handleRecommendations(e) {
    e.preventDefault();
    const form = e.target;
    const budget = form.querySelector('input[name="budget"]:checked')?.value;
    const region = $('#rec-region')?.value;
    const activities = Array.from(form.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value);

    if (!budget || !region) {
        alert('Veuillez sélectionner un budget et une région.');
        return;
    }

    const resultsContainer = $('#recommendations-results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '<div class="loading-spinner">Analyse de vos préférences...</div>';

    try {
        const data = await apiPost('/recommendations', { budget, region, activities });
        const recommendations = Array.isArray(data) ? data : (data.recommendations || []);
        renderRecommendations(recommendations);
    } catch (err) {
        resultsContainer.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
}

function renderRecommendations(recommendations) {
    const container = $('#recommendations-results');
    if (!container) return;

    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Aucune recommandation trouvée pour ces critères.</div>';
        return;
    }

    container.innerHTML = recommendations.map(rec => `
        <article class="card">
            <div class="card-image">✨</div>
            <div class="card-body">
                <div class="card-header-row">
                    <h3 class="card-title">${escapeHtml(rec.name)}</h3>
                    <span class="badge ${getBudgetClass(rec.budget)}">${escapeHtml(getBudgetLabel(rec.budget))}</span>
                </div>
                <p class="card-country">${escapeHtml(rec.country || '')}</p>
                <p class="card-description">${escapeHtml(rec.description || '')}</p>
                <div class="card-tags">
                    ${(rec.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <button class="btn btn-success btn-add-itinerary" data-dest-id="${escapeHtml(rec.id || '')}" data-dest-name="${escapeHtml(rec.name)}">
                        ➕ Ajouter à mes itinéraires
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    $$('.btn-add-itinerary').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isAuthenticated()) {
                showView('auth');
                showMessage('login-message', 'Connectez-vous pour ajouter un itinéraire.', 'error');
                return;
            }
            const destId = btn.dataset.destId;
            const destName = btn.dataset.destName;
            showView('itineraries');
            
            const select = $('#it-destination');
            if (select) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text.includes(destName) || select.options[i].value === destId) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
        });
    });
}

/* ============================================
   ITINÉRAIRES
   ============================================ */
async function loadDestinationsIntoSelect() {
    const select = $('#it-destination');
    if (!select) return;

    select.innerHTML = '<option value="">Chargement...</option>';

    try {
        if (allDestinations.length === 0) {
            const data = await apiGet('/destinations');
            allDestinations = Array.isArray(data) ? data : (data.destinations || []);
        }
        
        const optionsHtml = allDestinations
            .map(d => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} — ${escapeHtml(d.country || '')}</option>`)
            .join('');

        select.innerHTML = '<option value="">Choisir une destination</option>' + optionsHtml;
    } catch (err) {
        select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

async function loadItineraries() {
    const container = $('#itineraries-list');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner">Chargement de vos itinéraires...</div>';

    try {
        const data = await apiGet('/itineraries');
        const itineraries = Array.isArray(data) ? data : (data.itineraries || []);
        renderItineraries(itineraries);
    } catch (err) {
        container.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
}

function renderItineraries(itineraries) {
    const container = $('#itineraries-list');
    if (!container) return;

    if (!itineraries || itineraries.length === 0) {
        container.innerHTML = `
            <div class="itinerary-empty">
                <p>Vous n'avez aucun itinéraire pour le moment.</p>
            </div>
        `;
        return;
    }

    // Affiche le titre, les dates et la liste des destinations
    container.innerHTML = itineraries.map(it => `
        <div class="itinerary-card">
            <div class="itinerary-card-header">
                <span class="itinerary-card-title">📌 ${escapeHtml(it.title)}</span>
            </div>
            <p class="itinerary-card-dates">📅 ${escapeHtml(formatDate(it.start_date))} → ${escapeHtml(formatDate(it.end_date))}</p>
            ${it.destinations && it.destinations.length > 0 ? `
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <strong>Destinations :</strong> ${escapeHtml(it.destinations.join(', '))}
                </p>
            ` : ''}
        </div>
    `).join('');
}
async function handleCreateItinerary(e) {
    e.preventDefault();

    // 1. On récupère ce que l'utilisateur a tapé/sélectionné
    const title = $('#it-title')?.value.trim();
    const select = $('#it-destination');
    const startDate = $('#it-start')?.value || '';
    const endDate = $('#it-end')?.value || '';

    // On récupère le nom de la destination choisie dans le menu déroulant
    let selectedDestinations = [];
    if (select && select.value) {
        const destName = select.options[select.selectedIndex].text.split(' — ')[0];
        selectedDestinations.push(destName);
    }

    // Validation : Le titre est obligatoire pour votre serveur Python
    if (!title) {
        showMessage('itinerary-message', 'Veuillez donner un titre à votre itinéraire.', 'error');
        return;
    }

    // 2. On prépare les données exactes attendues par votre fichier Python
    const payload = {
        title: title,
        destinations: selectedDestinations,
        start_date: startDate,
        end_date: endDate
    };

    // 3. On envoie au serveur
    try {
        await apiPost('/itineraries', payload);
        showMessage('itinerary-message', 'Itinéraire créé avec succès !', 'success');
        $('#itinerary-form').reset();
        loadItineraries(); // On rafraîchit la liste des itinéraires
    } catch (err) {
        showMessage('itinerary-message', err.message, 'error');
    }
}

/* ============================================
   NAVIGATION & EVENT LISTENERS
   ============================================ */
function initEventListeners() {
    $$('.nav-link[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view) showView(view);
        });
    });

    $('#nav-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    $('#nav-toggle')?.addEventListener('click', () => {
        $('#nav-links')?.classList.toggle('open');
    });

    $$('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    $('#register-form')?.addEventListener('submit', handleRegister);
    $('#login-form')?.addEventListener('submit', handleLogin);
    $('#recommendations-form')?.addEventListener('submit', handleRecommendations);
    $('#itinerary-form')?.addEventListener('submit', handleCreateItinerary);

    $('#dest-search')?.addEventListener('input', filterDestinations);
    $('#dest-region-filter')?.addEventListener('change', filterDestinations);
    $('#dest-budget-filter')?.addEventListener('change', filterDestinations);
}

/* ============================================
   DÉMARRAGE
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    initEventListeners();
    showView('destinations');
});