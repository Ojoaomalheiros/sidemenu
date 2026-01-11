export default {
  editor: {
    label: {
      en: 'Side Menu',
      pt: 'Menu Lateral',
    },
    icon: 'menu',
  },
  triggerEvents: [
    {
      name: 'menu-item-click',
      label: { en: 'On Menu Item Click' },
      event: { itemId: '', itemLabel: '', itemUrl: '' },
    },
    {
      name: 'logout-click',
      label: { en: 'On Logout Click' },
      event: {},
    },
    {
      name: 'settings-click',
      label: { en: 'On Settings Click' },
      event: {},
    },
    {
      name: 'help-click',
      label: { en: 'On Help Click' },
      event: {},
    },
  ],
  properties: {
    // Logo Section
    logoUrl: {
      label: { en: 'Logo', pt: 'Logo' },
      type: 'Image',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Logo image for the sidebar',
      },
      propertyHelp: {
        tooltip: 'Upload or select a logo image to display in the sidebar',
      },
      /* wwEditor:end */
    },
    logoText: {
      label: { en: 'Logo Text' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'flashcrm',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Text to display as logo',
      },
      /* wwEditor:end */
    },
    logoColor: {
      label: { en: 'Logo Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#007AFF',
    },

    // Status Indicator
    showStatusIndicator: {
      label: { en: 'Show Status Indicator' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the status indicator',
      },
      /* wwEditor:end */
    },
    statusText: {
      label: { en: 'Status Text' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Whatsapp Desconectado',
      hidden: (content) => !content?.showStatusIndicator,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Status indicator text',
      },
      /* wwEditor:end */
    },
    statusType: {
      label: { en: 'Status Type' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'connected', label: 'Connected (Green)' },
          { value: 'disconnected', label: 'Disconnected (Red)' },
          { value: 'warning', label: 'Warning (Yellow)' },
        ],
      },
      defaultValue: 'disconnected',
      bindable: true,
      hidden: (content) => !content?.showStatusIndicator,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: connected | disconnected | warning',
      },
      /* wwEditor:end */
    },

    // Menu Items
    menuItems: {
      label: { en: 'Menu Items' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home', url: '/dashboard', badge: '', disabled: false },
        { id: 'segmentos', label: 'Segmentos', icon: 'users', url: '/segmentos', badge: '', disabled: false },
        { id: 'campanhas', label: 'Campanhas', icon: 'send', url: '/campanhas', badge: '', disabled: false },
        { id: 'automacoes', label: 'Automações', icon: 'route', url: '/automacoes', badge: '', disabled: false },
        { id: 'templates', label: 'Templates', icon: 'template', url: '/templates', badge: '', disabled: false },
        { id: 'clientes', label: 'Clientes', icon: 'user', url: '/clientes', badge: '', disabled: false },
        { id: 'cashbacks', label: 'Cashbacks', icon: 'coins', url: '/cashbacks', badge: '', disabled: false },
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || item?.id || 'Menu Item';
        },
        item: {
          type: 'Object',
          defaultValue: { id: 'item', label: 'New Item', icon: 'circle', url: '/', badge: '', disabled: false },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              label: { label: { en: 'Label' }, type: 'Text' },
              icon: {
                label: { en: 'Icon' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'home', label: 'Home' },
                    { value: 'users', label: 'Users' },
                    { value: 'send', label: 'Send (Paper Plane)' },
                    { value: 'template', label: 'Template' },
                    { value: 'route', label: 'Route' },
                    { value: 'user', label: 'User' },
                    { value: 'coins', label: 'Coins' },
                    { value: 'chart', label: 'Chart' },
                    { value: 'settings', label: 'Settings' },
                    { value: 'circle', label: 'Circle' },
                  ],
                },
                defaultValue: 'circle',
              },
              url: { label: { en: 'URL' }, type: 'Text' },
              badge: { label: { en: 'Badge Text' }, type: 'Text' },
              disabled: { label: { en: 'Disabled' }, type: 'OnOff' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of menu items with id, label, icon, url, badge, disabled',
      },
      /* wwEditor:end */
    },

    // Formula properties for dynamic field mapping
    menuItemsIdFormula: {
      label: { en: 'ID Field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.menuItems) && content.menuItems.length > 0 ? content.menuItems[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['id']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.menuItems) || !content.menuItems?.length || !boundProps.menuItems,
    },
    menuItemsLabelFormula: {
      label: { en: 'Label Field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.menuItems) && content.menuItems.length > 0 ? content.menuItems[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['label']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.menuItems) || !content.menuItems?.length || !boundProps.menuItems,
    },
    menuItemsIconFormula: {
      label: { en: 'Icon Field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.menuItems) && content.menuItems.length > 0 ? content.menuItems[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['icon']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.menuItems) || !content.menuItems?.length || !boundProps.menuItems,
    },
    menuItemsUrlFormula: {
      label: { en: 'URL Field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.menuItems) && content.menuItems.length > 0 ? content.menuItems[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['url']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.menuItems) || !content.menuItems?.length || !boundProps.menuItems,
    },

    // Active Item
    activeItemId: {
      label: { en: 'Active Item ID' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'ID of the currently active menu item',
      },
      /* wwEditor:end */
    },

    // Bottom Actions
    showHelp: {
      label: { en: 'Show Help' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    helpLabel: {
      label: { en: 'Help Label' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Ajuda',
      hidden: (content) => !content?.showHelp,
    },
    showSettings: {
      label: { en: 'Show Settings' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    settingsLabel: {
      label: { en: 'Settings Label' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Configuracoes',
      hidden: (content) => !content?.showSettings,
    },
    showLogout: {
      label: { en: 'Show Logout' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    logoutLabel: {
      label: { en: 'Logout Label' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Sair',
      hidden: (content) => !content?.showLogout,
    },

    // User Profile
    showUserProfile: {
      label: { en: 'Show User Profile' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    userGreeting: {
      label: { en: 'User Greeting' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Ola',
      hidden: (content) => !content?.showUserProfile,
    },
    userName: {
      label: { en: 'User Name', pt: 'Nome do Usuário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      hidden: (content) => !content?.showUserProfile,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: "Bind to: collections['2a7ebac6-154a-4af7-8337-411e42e6a35c']?.['data']?.[0]?.['nome']",
      },
      /* wwEditor:end */
    },
    userAvatar: {
      label: { en: 'User Avatar URL' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      hidden: (content) => !content?.showUserProfile,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL of user avatar image',
      },
      /* wwEditor:end */
    },

    // Styling
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ffffff',
    },
    textColor: {
      label: { en: 'Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#374151',
    },
    activeItemColor: {
      label: { en: 'Active Item Background' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f3f4f6',
    },
    activeTextColor: {
      label: { en: 'Active Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1A1A1A',
    },
    hoverColor: {
      label: { en: 'Hover Background' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f9fafb',
    },
    badgeColor: {
      label: { en: 'Badge Background' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#7c3aed',
    },
    badgeTextColor: {
      label: { en: 'Badge Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ffffff',
    },
    borderColor: {
      label: { en: 'Border Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#e5e7eb',
    },
    width: {
      label: { en: 'Width' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '240px',
    },
  },
};
