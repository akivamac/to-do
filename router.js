// ════════════════════════════════════════════════════════════════════════════
// SCRIPT 1: Route Query Param Handler
// ════════════════════════════════════════════════════════════════════════════

const _route = new URLSearchParams(window.location.search).get('route');
if (_route) history.replaceState({}, '', '/to-do/' + _route);
if (_route === 'login') window._startRoute = 'login';
else if (_route === 'sign-up') window._startRoute = 'signup';

// ════════════════════════════════════════════════════════════════════════════
// SCRIPT 2: Router Block (initRouter, handleRouting, navigateTo + wrappers)
// ════════════════════════════════════════════════════════════════════════════

// Router initialization - handle URL routing via 404.html bridge
function initRouter() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
        return;
    }

    // Get stored path from 404.html redirect, or use current pathname
    let routePath = sessionStorage.getItem('routerPath');
    if (routePath) {
        sessionStorage.removeItem('routerPath');
    } else {
        routePath = window.location.pathname;
    }

    // Always handle routing (prevents blank page)
    try {
        handleRouting(routePath);
    } catch (e) {
        console.error('Routing error:', e);
        // Fallback: show landing page
        showLandingPage();
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        handleRouting(window.location.pathname);
    });
}

function handleRouting(path) {
    const isLoggedIn = !!localStorage.getItem('currentUser');

    if (path.includes('/to-do/app') || path === '/to-do/') {
        if (isLoggedIn) {
            if (path.includes('/to-do/app')) {
                loadAndShowApp();
            } else {
                // Redirect / to /app if logged in
                navigateTo('/to-do/app');
            }
        } else {
            // Not logged in, show landing page
            showLandingPage();
            navigateTo('/to-do/');
        }
    } else if (path.includes('/to-do/login')) {
        if (isLoggedIn) {
            navigateTo('/to-do/app');
        } else {
            showSignIn();
            navigateTo('/to-do/login');
        }
    } else if (path.includes('/to-do/sign-up')) {
        if (isLoggedIn) {
            navigateTo('/to-do/app');
        } else {
            showCreateAccount();
            navigateTo('/to-do/sign-up');
        }
    } else {
        // Default: show landing page for unmatched routes
        if (isLoggedIn) {
            navigateTo('/to-do/app');
            loadAndShowApp();
        } else {
            showLandingPage();
            navigateTo('/to-do/');
        }
    }
}

function navigateTo(path) {
    // Update URL using history.pushState without page reload
    history.pushState(null, '', path);
}

// Wrap existing navigation functions to also update URL
const originalShowSignIn = showSignIn;
showSignIn = function() {
    originalShowSignIn.call(this);
    navigateTo('/to-do/login');
};

const originalShowCreateAccount = showCreateAccount;
showCreateAccount = function() {
    originalShowCreateAccount.call(this);
    navigateTo('/to-do/sign-up');
};

const originalLogout = logout;
logout = function() {
    originalLogout.call(this);
    navigateTo('/to-do/');
    showLandingPage();
};

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}
