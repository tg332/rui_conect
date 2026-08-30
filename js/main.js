/* ============================================================
   RUI CONECTI — main.js
   Interações globais: menu mobile, marcação do link ativo,
   pequenas melhorias de acessibilidade.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initOverflowMenu();
  markActiveNavLink();
  initAccordion();
  initLoginModal();
});

/**
 * Abre/fecha a gaveta de navegação mobile (hambúrguer) e fecha
 * automaticamente ao clicar em um link ou pressionar Esc.
 */
function initMobileDrawer() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/**
 * Abre/fecha o menu "···" (Simulados, Plano de Estudos, Fórum, Perfil).
 * Fecha ao clicar fora, ao escolher um item, ou com Esc.
 */
function initOverflowMenu() {
  const toggle = document.getElementById('overflow-toggle');
  const menu = document.getElementById('overflow-menu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

/**
 * Adiciona aria-current="page" ao link do menu que corresponde
 * à página atual, comparando o caminho do arquivo.
 */
function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-drawer a').forEach((link) => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

/**
 * Acordeão de tópicos (ex.: página "Informações do ENEM").
 * Abre um item por vez; clicar num item aberto o fecha de novo.
 * Não faz nada se não houver acordeão na página.
 */
function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll('.accordion-trigger');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Fecha todos os itens do mesmo acordeão
        triggers.forEach((t) => {
          t.setAttribute('aria-expanded', 'false');
          const p = document.getElementById(t.getAttribute('aria-controls'));
          if (p) p.hidden = true;
        });

        // Reabre o clicado, se estava fechado
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          if (panel) panel.hidden = false;
        }
      });
    });
  });
}

function initLoginModal() {

    const loginButton = document.querySelector('.user-avatar-btn');

    if (!loginButton) return;

    loginButton.addEventListener('click', (e) => {

        e.preventDefault();

        abrirModal('pages/login.html');
    });
}


function abrirModal(pagina, fullscreen = false) {

    const modal = document.createElement('div');

    modal.className = fullscreen ? 'login-modal login-modal--fullscreen' : 'login-modal';

    modal.innerHTML = `
        <div class="login-modal-content${fullscreen ? ' login-modal-content--fullscreen' : ''}">

            <button class="login-modal-close" aria-label="Fechar">
                &times;
            </button>

            <iframe
                src="${pagina}"
                title="Página">
            </iframe>

        </div>
    `;

    document.body.appendChild(modal);

    const iframe = modal.querySelector('iframe');
    const fechar = modal.querySelector('.login-modal-close');

    fechar.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

window.addEventListener('message', (event) => {

    if (event.data.tipo === 'abrir-cadastro') {

        const modal = document.querySelector('.login-modal');

        if (modal) {
            modal.remove();
        }

        abrirModal('pages/cadastro.html', true);

    }

});