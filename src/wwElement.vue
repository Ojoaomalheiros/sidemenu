<template>
  <nav ref="sidemenuRef" class="sidemenu" :style="computedStyle">
    <!-- Logo Section -->
    <div class="sidemenu-logo">
      <img
        v-if="logoUrl && !logoError"
        :src="logoUrl"
        alt="Logo"
        class="logo-image"
        @load="handleLogoLoad"
        @error="handleLogoError"
      />
      <div v-else class="logo-text">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" :fill="content?.logoColor || '#007AFF'"/>
        </svg>
        <span :style="{ color: content?.logoColor || '#007AFF' }">{{ content?.logoText || 'flashcrm' }}</span>
      </div>
    </div>

    <!-- Status Indicator (only shows when disconnected) -->
    <div v-if="content?.showStatusIndicator && statusType === 'disconnected'" class="sidemenu-status status--disconnected">
      <span class="status-dot"></span>
      <span class="status-text">Whatsapp Desconectado</span>
    </div>

    <!-- Main Navigation -->
    <div class="sidemenu-nav">
      <button
        v-for="item in processedMenuItems"
        :key="item.id"
        class="nav-item"
        :class="{
          'nav-item--active': item.id === content?.activeItemId,
          'nav-item--disabled': item.disabled
        }"
        :disabled="item.disabled"
        @click="handleMenuItemClick(item)"
      >
        <wwElement
          v-if="item.id === 'campanhas' && content?.campanhasIcon"
          :ww-props="content.campanhasIcon"
          class="nav-item-icon"
        ></wwElement>
        <span v-else class="nav-item-icon" v-html="getIconSvg(item.icon)"></span>
        <span class="nav-item-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-item-badge">{{ item.badge }}</span>
      </button>
    </div>

    <!-- Bottom Section -->
    <div class="sidemenu-bottom">
      <!-- Help -->
      <button v-if="content?.showHelp" class="bottom-item" @click="handleHelpClick">
        <span class="bottom-item-icon" v-html="helpIcon"></span>
        <span class="bottom-item-label">{{ content?.helpLabel || 'Ajuda' }}</span>
      </button>

      <!-- Settings -->
      <button v-if="content?.showSettings" class="bottom-item" @click="handleSettingsClick">
        <span class="bottom-item-icon" v-html="settingsIcon"></span>
        <span class="bottom-item-label">{{ content?.settingsLabel || 'Configuracoes' }}</span>
      </button>

      <!-- Logout -->
      <button v-if="content?.showLogout" class="bottom-item" @click="handleLogoutClick">
        <span class="bottom-item-icon" v-html="logoutIcon"></span>
        <span class="bottom-item-label">{{ content?.logoutLabel || 'Sair' }}</span>
      </button>

      <!-- User Profile -->
      <div v-if="content?.showUserProfile" class="user-profile">
        <div class="user-avatar">
          <img v-if="content?.userAvatar" :src="content.userAvatar" alt="Avatar" />
          <span v-else class="avatar-placeholder" v-html="userIcon"></span>
        </div>
        <div class="user-info">
          <span class="user-greeting">{{ content?.userGreeting || 'Ola' }}</span>
          <span class="user-name">{{ userName }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const sidemenuRef = ref(null);
    const logoError = ref(false);

    // Logo URL computed (WeWeb returns relative paths, need to prefix with CDN)
    const logoUrl = computed(() => {
      const url = props.content?.logoUrl;
      if (!url) return '';

      // If it's already a full URL, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // Otherwise, prefix with WeWeb CDN base URL
      return `https://cdn.weweb.io/${url}`;
    });

    // Reset logo error when URL changes
    watch(() => props.content?.logoUrl, () => {
      logoError.value = false;
    });

    // Logo event handlers
    const handleLogoLoad = () => {
      // Logo loaded successfully
    };

    const handleLogoError = () => {
      logoError.value = true;
    };

    // Collection IDs
    const USER_COLLECTION_ID = '2a7ebac6-154a-4af7-8337-411e42e6a35c';
    const WHATSAPP_COLLECTION_ID = 'a0220821-e59b-4484-97a4-a5ab8dea3a72';

    // Fetch user name from collection
    const userName = computed(() => {
      try {
        // First check if there's a manual override via props
        if (props.content?.userName) {
          return props.content.userName;
        }

        // Access collection directly from store
        if (typeof wwLib !== 'undefined' && wwLib.$store) {
          const collections = wwLib.$store.getters['data/getCollections'];
          const nome = collections?.[USER_COLLECTION_ID]?.data?.[0]?.nome;
          if (nome) {
            return nome;
          }
        }
      } catch (error) {
        console.error('[Sidemenu] Erro ao buscar nome do usuário:', error);
      }

      return 'Usuário';
    });

    // Fetch WhatsApp status from collection
    const whatsappStatus = computed(() => {
      try {
        if (typeof wwLib !== 'undefined' && wwLib.$store) {
          const collections = wwLib.$store.getters['data/getCollections'];
          const status = collections?.[WHATSAPP_COLLECTION_ID]?.data?.[0]?.status;
          if (status) {
            return status.toLowerCase();
          }
        }
      } catch (error) {
        console.error('[Sidemenu] Erro ao buscar status do WhatsApp:', error);
      }

      return 'desconectado';
    });

    // Computed status type based on WhatsApp status (connected or disconnected)
    const statusType = computed(() => {
      return whatsappStatus.value === 'conectado'
        ? 'connected'
        : 'disconnected';
    });

    onMounted(() => {
      // Use wwLib for proper WeWeb integration
      const frontWindow = typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : window;
      const frontDocument = typeof wwLib !== 'undefined' ? wwLib.getFrontDocument() : document;

      if (sidemenuRef.value) {
        // Force full height on parent elements
        let parent = sidemenuRef.value.parentElement;
        const body = frontDocument.body;
        while (parent && parent !== body) {
          // Try to force height on WeWeb wrapper elements
          if (parent.offsetHeight < frontWindow.innerHeight) {
            parent.style.height = '100vh';
            parent.style.minHeight = '100vh';
          }
          parent = parent.parentElement;
        }
      }
    });
    // Process menu items with formula support
    const processedMenuItems = computed(() => {
      const items = props.content?.menuItems || [];

      if (!Array.isArray(items)) return [];

      return items.map((item, index) => {
        // Use formula mapping if available, otherwise fall back to direct properties
        let id, label, icon, url, badge, disabled;

        if (typeof wwLib !== 'undefined' && wwLib.wwFormula?.useFormula) {
          const { resolveMappingFormula } = wwLib.wwFormula.useFormula();
          id = resolveMappingFormula(props.content?.menuItemsIdFormula, item) ?? item?.id;
          label = resolveMappingFormula(props.content?.menuItemsLabelFormula, item) ?? item?.label;
          icon = resolveMappingFormula(props.content?.menuItemsIconFormula, item) ?? item?.icon;
          url = resolveMappingFormula(props.content?.menuItemsUrlFormula, item) ?? item?.url;
        } else {
          id = item?.id;
          label = item?.label;
          icon = item?.icon;
          url = item?.url;
        }

        badge = item?.badge || '';
        disabled = item?.disabled || false;

        return {
          id: id || `item-${index}`,
          label: label || 'Menu Item',
          icon: icon || 'circle',
          url: url || '#',
          badge,
          disabled,
          originalItem: item,
        };
      });
    });

    // Computed styles
    const computedStyle = computed(() => ({
      '--bg-color': props.content?.backgroundColor || '#ffffff',
      '--text-color': props.content?.textColor || '#374151',
      '--active-bg': props.content?.activeItemColor || '#f3f4f6',
      '--active-text': props.content?.activeTextColor || '#1A1A1A',
      '--hover-bg': props.content?.hoverColor || '#f9fafb',
      '--badge-bg': props.content?.badgeColor || '#7c3aed',
      '--badge-text': props.content?.badgeTextColor || '#ffffff',
      '--border-color': props.content?.borderColor || '#e5e7eb',
      '--menu-width': props.content?.width || '240px',
    }));

    // Icon SVGs
    const getIconSvg = (iconName) => {
      const icons = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>',
        'paper-plane': '<svg viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"><path d="M210.3 35.9L23.9 88.4a8 8 0 00-1.2 15l85.6 40.5a8 8 0 013.7 3.7l40.5 85.6a8 8 0 0015-1.2l52.5-186.4a8 8 0 00-9.7-9.7z"/><path d="M110.6 145.4l45.3-45.3"/></svg>',
        route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
        template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
      };
      return icons[iconName] || icons.circle;
    };

    const helpIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    const settingsIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';

    const logoutIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

    const userIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    // Event handlers
    const handleMenuItemClick = (item) => {
      if (item?.disabled) return;

      // Navigate to the page if URL is provided
      if (item?.url && typeof wwLib !== 'undefined') {
        try {
          wwLib.goTo(item.url);
        } catch (error) {
          console.warn('[Sidemenu] Erro ao navegar com wwLib.goTo, tentando fallback:', error);
          const frontWindow = wwLib.getFrontWindow ? wwLib.getFrontWindow() : window;
          frontWindow.location.href = item.url;
        }
      }

      emit('trigger-event', {
        name: 'menu-item-click',
        event: {
          itemId: item?.id || '',
          itemLabel: item?.label || '',
          itemUrl: item?.url || '',
        },
      });
    };

    const handleHelpClick = () => {
      // Open WhatsApp help link in new tab
      const frontWindow = typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : window;
      frontWindow.open('https://wa.me/552799490800?text=Estou%20precisando%20de%20ajuda', '_blank');

      emit('trigger-event', {
        name: 'help-click',
        event: {},
      });
    };

    const handleSettingsClick = () => {
      // Navigate to settings page
      if (typeof wwLib !== 'undefined') {
        try {
          wwLib.goTo('/configuracoes');
        } catch (error) {
          console.warn('[Sidemenu] Erro ao navegar com wwLib.goTo, tentando fallback:', error);
          const frontWindow = wwLib.getFrontWindow ? wwLib.getFrontWindow() : window;
          frontWindow.location.href = '/configuracoes';
        }
      }

      emit('trigger-event', {
        name: 'settings-click',
        event: {},
      });
    };

    const handleLogoutClick = () => {
      emit('trigger-event', {
        name: 'logout-click',
        event: {},
      });
    };

    return {
      sidemenuRef,
      logoUrl,
      logoError,
      handleLogoLoad,
      handleLogoError,
      userName,
      statusType,
      processedMenuItems,
      computedStyle,
      getIconSvg,
      helpIcon,
      settingsIcon,
      logoutIcon,
      userIcon,
      handleMenuItemClick,
      handleHelpClick,
      handleSettingsClick,
      handleLogoutClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.sidemenu {
  display: flex !important;
  flex-direction: column !important;
  width: var(--menu-width, 220px);
  height: 100vh !important;
  min-height: 100vh !important;
  max-height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  background: var(--bg-color, #ffffff);
  border-right: 1px solid var(--border-color, #e5e7eb);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box !important;
  overflow-y: auto;
  z-index: 100;
}

// Logo Section
.sidemenu-logo {
  padding: 20px 16px 32px 20px;

  .logo-image {
    max-height: 40px;
    width: auto;
  }

  .logo-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 22px;
    font-weight: 700;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }
}

// Status Indicator
.sidemenu-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 0 12px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-color, #374151);

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.status--connected .status-dot {
    background: #22c55e;
  }

  &.status--disconnected .status-dot {
    background: #ef4444;
  }

  &.status--warning .status-dot {
    background: #f59e0b;
  }
}

// Main Navigation
.sidemenu-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 4px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #374151);
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #e5e7eb;
  }

  &.nav-item--active {
    background-color: var(--active-bg, #f3f4f6);
    color: var(--active-text, #1A1A1A);

    &:hover {
      background-color: #e5e7eb;
    }
  }

  &.nav-item--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
      cursor: not-allowed;
    }
  }

  .nav-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .nav-item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-item-badge {
    padding: 2px 8px;
    background: var(--badge-bg, #7c3aed);
    color: var(--badge-text, #ffffff);
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
}

// Bottom Section
.sidemenu-bottom {
  padding: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: auto;
}

.bottom-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 4px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #374151);
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #e5e7eb;
  }

  .bottom-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .bottom-item-label {
    flex: 1;
  }
}

// User Profile
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--border-color, #e5e7eb);

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--active-bg, #f3f4f6);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--text-color, #374151);

      :deep(svg) {
        width: 100%;
        height: 100%;
      }
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .user-greeting {
      font-size: 13px;
      font-weight: 500;
      color: var(--active-text, #1A1A1A);
    }

    .user-name {
      font-size: 12px;
      color: var(--text-color, #374151);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
