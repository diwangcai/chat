// 开发环境下注入 axe-core
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 动态导入避免 SSR 问题
  import('@axe-core/react').then(({ injectAxe }) => {
    injectAxe({
      // 配置 axe-core 选项
      rules: [
        // 启用所有 WCAG 2.1 AA 规则
        { id: 'color-contrast', enabled: true },
        { id: 'color-contrast-enhanced', enabled: true },
        { id: 'button-name', enabled: true },
        { id: 'image-alt', enabled: true },
        { id: 'input-button-name', enabled: true },
        { id: 'link-name', enabled: true },
        { id: 'heading-order', enabled: true },
        { id: 'html-has-lang', enabled: true },
        { id: 'html-lang-valid', enabled: true },
        { id: 'landmark-one-main', enabled: true },
        { id: 'page-has-heading-one', enabled: true },
        { id: 'region', enabled: true },
        { id: 'skip-link', enabled: true },
        { id: 'tabindex', enabled: true },
        { id: 'focus-order-semantics', enabled: true },
        { id: 'focusable-content', enabled: true },
        { id: 'interactive-supports-focus', enabled: true },
        { id: 'keyboard', enabled: true },
        { id: 'no-focusable-content', enabled: true },
        { id: 'role-has-required-aria-props', enabled: true },
        { id: 'role-supports-aria-props', enabled: true },
        { id: 'aria-allowed-attr', enabled: true },
        { id: 'aria-allowed-role', enabled: true },
        { id: 'aria-required-attr', enabled: true },
        { id: 'aria-required-children', enabled: true },
        { id: 'aria-required-parent', enabled: true },
        { id: 'aria-roles', enabled: true },
        { id: 'aria-valid-attr', enabled: true },
        { id: 'aria-valid-attr-value', enabled: true },
        { id: 'aria-valid-role', enabled: true },
      ],
      // 排除一些开发工具和第三方组件
      exclude: [
        '#__next-build-watcher',
        '#__next-prerender-indicator',
        '[data-testid="dev-overlay"]',
      ],
      // 设置标签
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    })
  }).catch((error) => {
    console.warn('Failed to load axe-core:', error)
  })
}