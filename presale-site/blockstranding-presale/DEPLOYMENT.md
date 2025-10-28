# 部署指南

## 问题诊断

GitHub Actions 显示部署成功，但访问时出现 404 错误。这通常是因为：

1. GitHub Pages 没有正确配置
2. 部署路径设置错误
3. GitHub Pages 服务未启用

## 解决方案

### 方案1：使用 Netlify（推荐）

1. 访问 [netlify.com](https://netlify.com)
2. 注册/登录账户
3. 选择 "Deploy manually"
4. 将 `dist` 文件夹拖拽到部署区域
5. 等待部署完成，获得在线URL

### 方案2：修复 GitHub Pages

1. 进入 GitHub 仓库的 Settings
2. 找到 "Pages" 部分
3. 确保 Source 设置为 "GitHub Actions"
4. 检查部署状态

### 方案3：使用 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 连接 GitHub 仓库
3. 选择 `presale-site/blockstranding-presale` 目录
4. 自动部署

## 当前状态

- ✅ 代码已修复
- ✅ 构建成功
- ✅ GitHub Actions 运行成功
- ❌ GitHub Pages 配置有问题

## 建议

推荐使用 Netlify 进行部署，因为它：
- 配置简单
- 部署快速
- 支持自动部署
- 提供免费 HTTPS
