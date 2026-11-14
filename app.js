const ROBUX_SVG = `<svg class="rbx-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="#00e676" stroke-width="2.2" fill="rgba(0,230,118,0.15)"/>
<rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1" fill="#00e676"/>
</svg>`;

const AppState = {
  getUser() {
    const data = localStorage.getItem('cynorobux_user');
    return data ? JSON.parse(data) : null;
  },
  saveUser(user) {
    localStorage.setItem('cynorobux_user', JSON.stringify(user));
    this.updateUI();
  },
  login(username, password) {
    if (!username || username.trim().length < 3) {
      showToast('Roblox kullanıcı adı en az 3 karakter olmalıdır.', true);
      return false;
    }
    const existing = this.getUser();
    if (existing && existing.username.toLowerCase() === username.trim().toLowerCase()) {
      existing.loggedIn = true;
      this.saveUser(existing);
      showToast(`Tekrar hoş geldin, ${existing.username}!`);
      return true;
    }
    const newUser = {
      username: username.trim(),
      robloxId: Math.floor(100000000 + Math.random() * 899999999),
      balance: 5, // 5 R$ bonus
      wagered: 0,
      loggedIn: true,
      history: [
        { type: 'Bonus', detail: 'Giriş / Hoş Geldin Hediyesi', amount: '+5 R$', date: new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'}) }
      ]
    };
    this.saveUser(newUser);
    showToast(`Giriş başarılı! +5 R$ başlangıç bakiyesi tanımlandı.`);
    return true;
  },
  register(username, robloxIdInput, password) {
    if (!username || username.trim().length < 3) {
      showToast('Geçerli bir Roblox kullanıcı adı girin.', true);
      return false;
    }
    if (!password || password.length < 4) {
      showToast('Şifre en az 4 karakter olmalıdır.', true);
      return false;
    }
    const newUser = {
      username: username.trim(),
      robloxId: robloxIdInput && robloxIdInput.trim() ? robloxIdInput.trim() : Math.floor(100000000 + Math.random() * 899999999),
      balance: 5, // 5 R$ kayıt bonusu
      wagered: 0,
      loggedIn: true,
      history: [
        { type: 'Kayıt Bonusu', detail: 'Yeni Hesap Hediyesi', amount: '+5 R$', date: new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'}) }
      ]
    };
    this.saveUser(newUser);
    showToast(`Kayıt tamamlandı! 5 R$ başlangıç bakiyesi eklendi.`);
    return true;
  },
  logout() {
    const user = this.getUser();
    if (user) {
      user.loggedIn = false;
      this.saveUser(user);
    }
    showToast('Hesaptan çıkış yapıldı.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  },
  addBalance(amount, reason = 'Gamepass Yatırımı') {
    const user = this.getUser();
    if (!user || !user.loggedIn) {
      showToast('Lütfen önce sağ panelden veya Giriş sayfasından giriş yapın!', true);
      return false;
    }
    user.balance = Math.round((user.balance + amount) * 100) / 100;
    user.history.unshift({
      type: amount >= 0 ? 'Kazanç / Yatırım' : 'Oyun / Çekim',
      detail: reason,
      amount: (amount >= 0 ? '+' : '') + amount + ' R$',
      date: new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})
    });
    if (user.history.length > 20) user.history.pop();
    this.saveUser(user);
    return true;
  },
  addRequest(type, detail, amount) {
    const user = this.getUser();
    const reqs = JSON.parse(localStorage.getItem('cynorobux_requests') || '[]');
    const newReq = {
      id: 'REQ-' + Math.floor(10000 + Math.random() * 90000),
      username: user ? user.username : 'Misafir',
      type: type, // 'Çekim' veya 'Yatırım'
      detail: detail,
      amount: amount + ' R$',
      status: 'Beklemede',
      date: new Date().toLocaleString('tr-TR')
    };
    reqs.unshift(newReq);
    localStorage.setItem('cynorobux_requests', JSON.stringify(reqs));
  },
  updateUI() {
    const user = this.getUser();
    const isLogged = user && user.loggedIn;

    const navBalanceEl = document.getElementById('nav-balance-val');
    const navAuthBtns = document.getElementById('nav-auth-buttons');
    const navUserBox = document.getElementById('nav-user-box');
    const navUsernameEl = document.getElementById('nav-username');

    if (navBalanceEl) {
      navBalanceEl.textContent = isLogged ? user.balance.toLocaleString('tr-TR') : '0';
    }
    if (navAuthBtns && navUserBox) {
      navAuthBtns.style.display = isLogged ? 'none' : 'flex';
      navUserBox.style.display = isLogged ? 'flex' : 'none';
      if (isLogged && navUsernameEl) {
        navUsernameEl.textContent = user.username;
      }
    }

    const authFormsBox = document.getElementById('sidebar-auth-forms');
    const authProfileBox = document.getElementById('sidebar-user-profile');
    if (authFormsBox && authProfileBox) {
      if (isLogged) {
        authFormsBox.style.display = 'none';
        authProfileBox.style.display = 'block';
        document.getElementById('side-username').textContent = user.username;
        document.getElementById('side-userid').textContent = 'Roblox ID: #' + user.robloxId;
        document.getElementById('side-balance').textContent = user.balance.toLocaleString('tr-TR') + ' R$';
      } else {
        authFormsBox.style.display = 'block';
        authProfileBox.style.display = 'none';
      }
    }
  }
};

function showToast(msg, isError = false) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// Falling Robux Generator Helper
function initFallingRobux() {
  const bgContainer = document.createElement('div');
  bgContainer.className = 'falling-robux-container';
  const symbols = ['R$', '💎', '🪙', '🚀', '👑'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'falling-rbx';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = (Math.random() * -100) + 'px';
    el.style.fontSize = (Math.floor(Math.random() * 18) + 14) + 'px';
    el.style.animationDuration = (Math.floor(Math.random() * 10) + 8) + 's';
    el.style.animationDelay = (Math.random() * 8) + 's';
    bgContainer.appendChild(el);
  }
  document.body.prepend(bgContainer);
}

function renderLayout(activePage) {
  initFallingRobux();
  
  // Discord link variable (Admin panelden eklenecek yer placeholder)
  const discordLink = localStorage.getItem('cynorobux_discord') || 'https://discord.gg/cynorobux';

  const headerHTML = `
  <nav class="navbar">
    <a href="index.html" class="brand">
      <div class="brand-logo">R$</div>
      <div class="brand-text">
        <div class="brand-title">CYNO<span>ROBUX</span> <span class="official-badge">Partner Lab</span></div>
      </div>
    </a>

    <div class="nav-links">
      <a href="index.html" class="nav-link ${activePage === 'index' ? 'active' : ''}">🏠 Ana Sayfa</a>
      <a href="oyunlar.html" class="nav-link ${activePage === 'oyunlar' ? 'active' : ''}">🎮 Oyunlar</a>
      <a href="yatir.html" class="nav-link ${activePage === 'yatir' ? 'active' : ''}">➕ Robux Yatır</a>
      <a href="cek.html" class="nav-link ${activePage === 'cek' ? 'active' : ''}">💸 Robux Çek</a>
    </div>

    <div class="nav-right">
      <div class="balance-box">
        ${ROBUX_SVG}
        <span class="balance-amount"><span id="nav-balance-val">0</span> R$</span>
        <a href="yatir.html" class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;">+</a>
      </div>

      <a href="${discordLink}" target="_blank" class="btn btn-discord" style="padding: 8px 12px; font-size: 13px;">💬 Discord</a>

      <div id="nav-auth-buttons" style="display: flex; gap: 8px;">
        <a href="giris.html" class="btn btn-outline">Giriş</a>
        <a href="kayit.html" class="btn btn-primary">Kayıt</a>
      </div>

      <div id="nav-user-box" style="display: none; align-items: center; gap: 10px;">
        <span style="font-size: 13px; font-weight: 700; color: var(--roblox-green);">👤 <span id="nav-username">Oyuncu</span></span>
        <button onclick="AppState.logout()" class="btn btn-danger" style="padding: 7px 12px; font-size: 12px;">Çıkış</button>
      </div>
    </div>
  </nav>
  `;

  const footerHTML = `
  <footer class="footer">
    <div>
      <strong style="color: var::text-main;">CYNOROBUX</strong> — Roblox Topluluk & Gamepass Ödül Ekosistemi.
    </div>
    <div>
      7/24 Otomatik Gamepass Doğrulama • Anında İşlem Paneli
    </div>
  </footer>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
  AppState.updateUI();
}
