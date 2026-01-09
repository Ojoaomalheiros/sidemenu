<template>
  <nav class="sidemenu" :style="computedStyle">
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
        type="button"
        class="nav-item"
        :class="{
          'nav-item--active': item.id === content?.activeItemId,
          'nav-item--disabled': item.disabled
        }"
        :disabled="item.disabled"
        @click="handleMenuItemClick(item)"
      >
        <span class="nav-item-icon" v-html="getIconSvg(item.icon)"></span>
        <span class="nav-item-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-item-badge">{{ item.badge }}</span>
      </button>
    </div>

    <!-- Bottom Section -->
    <div class="sidemenu-bottom">
      <!-- Help -->
      <button v-if="content?.showHelp" type="button" class="bottom-item" @click="handleHelpClick">
        <span class="bottom-item-icon" v-html="helpIcon"></span>
        <span class="bottom-item-label">{{ content?.helpLabel || 'Ajuda' }}</span>
      </button>

      <!-- Settings -->
      <button v-if="content?.showSettings" type="button" class="bottom-item" @click="handleSettingsClick">
        <span class="bottom-item-icon" v-html="settingsIcon"></span>
        <span class="bottom-item-label">{{ content?.settingsLabel || 'Configuracoes' }}</span>
      </button>

      <!-- Logout -->
      <button v-if="content?.showLogout" type="button" class="bottom-item" @click="handleLogoutClick">
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
import { ref, computed, watch, onMounted } from 'vue'

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
    const logoError = ref(false)

    // Internal variables using WeWeb's component variable system (like working components)
    const { value: activeMenuItem, setValue: setActiveMenuItem } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'activeMenuItem',
      type: 'object',
      defaultValue: null,
    })

    // Logo URL computed (WeWeb returns relative paths, need to prefix with CDN)
    const logoUrl = computed(() => {
      const url = props.content?.logoUrl
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      return `https://cdn.weweb.io/${url}`
    })

    // Reset logo error when URL changes
    watch(() => props.content?.logoUrl, () => {
      logoError.value = false
    })

    const handleLogoLoad = () => {
      // Logo loaded successfully
    }

    const handleLogoError = () => {
      logoError.value = true
    }

    // Collection IDs
    const USER_COLLECTION_ID = '2a7ebac6-154a-4af7-8337-411e42e6a35c'
    const WHATSAPP_COLLECTION_ID = 'a0220821-e59b-4484-97a4-a5ab8dea3a72'

    // Fetch user name from collection (same pattern as working components)
    const userName = computed(() => {
      try {
        if (props.content?.userName) {
          return props.content.userName
        }
        const collections = wwLib.$store?.getters?.['data/getCollections']
        const nome = collections?.[USER_COLLECTION_ID]?.data?.[0]?.nome
        if (nome) {
          return nome
        }
      } catch (error) {
        /* wwEditor:start */
        console.error('[Sidemenu] Erro ao buscar nome do usuário:', error)
        /* wwEditor:end */
      }
      return 'Usuário'
    })

    // Fetch WhatsApp status from collection
    const whatsappStatus = computed(() => {
      try {
        const collections = wwLib.$store?.getters?.['data/getCollections']
        const status = collections?.[WHATSAPP_COLLECTION_ID]?.data?.[0]?.status
        if (status) {
          return status.toLowerCase()
        }
      } catch (error) {
        /* wwEditor:start */
        console.error('[Sidemenu] Erro ao buscar status do WhatsApp:', error)
        /* wwEditor:end */
      }
      return 'desconectado'
    })

    // Computed status type based on WhatsApp status
    const statusType = computed(() => {
      return whatsappStatus.value === 'conectado' ? 'connected' : 'disconnected'
    })

    // Process menu items with formula support (same pattern as working components)
    const processedMenuItems = computed(() => {
      const items = props.content?.menuItems || []
      if (!Array.isArray(items)) return []

      // Use formula mapping if available
      const { resolveMappingFormula } = wwLib.wwFormula.useFormula()

      return items.map((item, index) => {
        let id, label, icon, url, badge, disabled

        id = resolveMappingFormula(props.content?.menuItemsIdFormula, item) ?? item?.id
        label = resolveMappingFormula(props.content?.menuItemsLabelFormula, item) ?? item?.label
        icon = resolveMappingFormula(props.content?.menuItemsIconFormula, item) ?? item?.icon
        url = resolveMappingFormula(props.content?.menuItemsUrlFormula, item) ?? item?.url
        badge = item?.badge || ''
        disabled = item?.disabled || false

        return {
          id: id || `item-${index}`,
          label: label || 'Menu Item',
          icon: icon || 'circle',
          url: url || '#',
          badge,
          disabled,
          originalItem: item,
        }
      })
    })

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
    }))

    // Icon SVGs
    const getIconSvg = (iconName) => {
      const icons = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>',
        route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
        template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
      }
      return icons[iconName] || icons.circle
    }

    const helpIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    const settingsIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
    const logoutIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    const userIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'

    // Event handlers (same pattern as working components - direct call to wwLib.goTo)
    const handleMenuItemClick = (item) => {
      if (item?.disabled) return

      setActiveMenuItem(item)

      // Navigate directly like working components do
      if (item?.url) {
        wwLib.goTo(item.url)
      }

      emit('trigger-event', {
        name: 'menu-item-click',
        event: {
          itemId: item?.id || '',
          itemLabel: item?.label || '',
          itemUrl: item?.url || '',
        },
      })
    }

    const handleHelpClick = () => {
      // Open WhatsApp help link in new tab
      const frontWindow = wwLib.getFrontWindow()
      frontWindow.open('https://wa.me/552799490800?text=Estou%20precisando%20de%20ajuda', '_blank')

      emit('trigger-event', {
        name: 'help-click',
        event: {},
      })
    }

    const handleSettingsClick = () => {
      // Navigate directly like working components do
      wwLib.goTo('/configuracoes')

      emit('trigger-event', {
        name: 'settings-click',
        event: {},
      })
    }

    const handleLogoutClick = () => {
      emit('trigger-event', {
        name: 'logout-click',
        event: {},
      })
    }

    return {
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
    }
  },
}
</script>

<style lang="scss" scoped>
.sidemenu {
  display: flex;
  flex-direction: column;
  width: var(--menu-width, 240px);
  min-width: var(--menu-width, 240px);
  height: 100%;
  min-height: 100vh;
  background: var(--bg-color, #ffffff);
  border-right: 1px solid var(--border-color, #e5e7eb);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
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
