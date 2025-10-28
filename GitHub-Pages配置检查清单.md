# GitHub Pages 配置检查清单

## 🔍 当前状态检查

### 1. 检查仓库是否公开
- 访问：https://github.com/xiaomimi123/fumao-token-presale
- 确认仓库是 **Public** 状态
- 如果显示 "Private"，请点击 Settings → General → Danger Zone → Change repository visibility

### 2. 检查Pages设置
- 访问：https://github.com/xiaomimi123/fumao-token-presale/settings/pages
- 确认 Source 设置为：**GitHub Actions**
- 如果显示 "Deploy from a branch"，请改为 "GitHub Actions"

### 3. 检查Actions权限
- 访问：https://github.com/xiaomimi123/fumao-token-presale/settings/actions
- 确认 Actions permissions 设置为：**Allow all actions and reusable workflows**

### 4. 检查工作流运行状态
- 访问：https://github.com/xiaomimi123/fumao-token-presale/actions
- 查看 "Deploy GitHub Pages" 工作流是否正在运行或已完成

## 🚀 手动启用Pages（如果需要）

如果Pages未自动启用，请按以下步骤操作：

### 步骤1：启用GitHub Actions
1. 进入仓库 Settings → Actions → General
2. 选择 "Allow all actions and reusable workflows"
3. 点击 "Save"

### 步骤2：配置Pages
1. 进入仓库 Settings → Pages
2. 在 Source 下选择 "GitHub Actions"
3. 保存设置

### 步骤3：触发工作流
1. 进入 Actions 标签页
2. 找到 "Deploy GitHub Pages" 工作流
3. 点击 "Run workflow" 按钮
4. 选择 main 分支
5. 点击 "Run workflow"

## 📊 构建状态监控

### 正常构建流程：
1. **Checkout** - 检出代码 ✅
2. **Setup Node** - 设置Node.js环境 ✅
3. **Install dependencies** - 安装依赖包 ⏳
4. **Build** - 构建项目 ⏳
5. **Upload artifact** - 上传构建产物 ⏳
6. **Deploy to GitHub Pages** - 部署到Pages ⏳

### 预期构建时间：
- 首次构建：3-5分钟
- 后续构建：1-2分钟

## 🌐 访问地址

构建成功后，您的网站将在以下地址可用：
- **主要地址**：https://xiaomimi123.github.io/fumao-token-presale/
- **备用地址**：https://fumao-token-presale.pages.dev/（如果配置了Cloudflare）

## 🔧 故障排除

### 常见问题：

1. **构建失败 - 依赖安装错误**
   - 检查 package-lock.json 是否存在
   - 确认使用了 `--legacy-peer-deps` 参数

2. **构建失败 - 权限错误**
   - 确认仓库是公开的
   - 检查Actions权限设置

3. **Pages未显示内容**
   - 确认Source设置为GitHub Actions
   - 检查构建产物路径是否正确

4. **静态资源加载失败**
   - 确认vite.config.ts中base设置为"./"
   - 检查相对路径配置

## 📱 测试清单

构建完成后，请测试以下功能：

- [ ] 页面正常加载
- [ ] 钱包连接按钮显示
- [ ] 点击连接按钮弹出AppKit模态框
- [ ] 连接钱包后显示地址
- [ ] 授权按钮状态正确（未连接时禁用）
- [ ] 移动端响应式设计正常
- [ ] 所有静态资源（图片、CSS、JS）正常加载

## 🎯 下一步

1. 完成Pages配置
2. 等待首次构建完成
3. 测试网站功能
4. 更新生产环境配置（合约地址等）
5. 配置自定义域名（可选）

---

**当前时间**：$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**仓库状态**：需要手动检查
**建议操作**：按照上述清单逐步检查配置
