import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: 'Memoh',
  description: '长记忆、自托管、AI 驱动的个人生活助手',
  
  // GitHub Pages 部署配置
  // 使用自定义域名时，base 应该是 /
  base: '/',
  
  // 主题配置
  themeConfig: {
    // 网站标题（显示在导航栏）
    siteTitle: 'Memoh',
    
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'Telegram Bot', link: '/platforms/telegram' },
      { text: 'CLI 工具', link: '/cli/' }
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '配置', link: '/guide/configuration' }
          ]
        }
      ],
      '/platforms/': [
        {
          text: '平台集成',
          items: [
            { text: 'Telegram', link: '/platforms/telegram' }
          ]
        }
      ],
      '/cli/': [
        {
          text: '命令行工具',
          items: [
            { text: '介绍', link: '/cli/' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/memohai/Memoh' }
    ],
    
    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 Memoh'
    },
    
    // 搜索
    search: {
      provider: 'local'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/memohai/Memoh/edit/main/docs/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  ignoreDeadLinks: true,
})
