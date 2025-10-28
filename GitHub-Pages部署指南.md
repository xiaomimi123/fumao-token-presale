# GitHub Pages 部署指南

## 1. 创建GitHub仓库

1. 访问 [GitHub.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `fumao-token-presale`
   - **Description**: `福猫代币预售网站 - 基于Reown AppKit的多钱包DApp`
   - **Visibility**: Public 或 Private
   - **不要**勾选任何初始化选项

## 2. 上传代码

### 方法1：使用批处理脚本（推荐）
```bash
# 双击运行
上传到GitHub.bat
```

### 方法2：手动命令
```bash
# 添加远程仓库
git remote add origin https://github.com/您的用户名/fumao-token-presale.git

# 推送代码
git branch -M main
git push -u origin main
```

## 3. 配置GitHub Pages

1. 进入您的GitHub仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 配置设置：
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /presale-site/blockstranding-presale
5. 点击 "Save"

## 4. 等待部署

- GitHub Pages 通常需要 1-5 分钟完成部署
- 部署完成后，您会看到绿色的勾号
- 网站URL格式：`https://您的用户名.github.io/fumao-token-presale`

## 5. 测试网站

1. 访问您的GitHub Pages URL
2. 测试钱包连接功能
3. 测试USDT授权和空投领取
4. 检查移动端响应式设计

## 6. 自定义域名（可选）

如果需要使用自定义域名：
1. 在仓库根目录创建 `CNAME` 文件
2. 内容为您的域名，如：`presale.fumao.com`
3. 在DNS设置中添加CNAME记录指向 `您的用户名.github.io`

## 7. 更新网站

每次更新代码后：
```bash
git add .
git commit -m "更新描述"
git push origin main
```

GitHub Pages会自动重新部署。

## 8. 故障排除

### 常见问题：

1. **404错误**：检查Pages设置中的文件夹路径
2. **构建失败**：检查package.json中的构建脚本
3. **样式丢失**：确保所有静态资源路径正确

### 检查构建状态：
- 进入仓库的 "Actions" 标签
- 查看最新的workflow运行状态

## 9. 生产环境配置

部署到生产服务器前，请确保：

1. **更新合约地址**：
   - 修改 `presale-site/blockstranding-presale/src/contracts/config.ts`
   - 使用主网合约地址

2. **更新AppKit配置**：
   - 修改 `presale-site/blockstranding-presale/src/wallet/appkit.ts`
   - 更新metadata中的URL

3. **环境变量**：
   - 设置正确的RPC URL
   - 配置正确的Chain ID

## 10. 安全注意事项

- 不要将私钥或助记词提交到代码仓库
- 使用环境变量管理敏感配置
- 定期更新依赖包
- 启用GitHub的安全功能（如Dependabot）

---

**部署完成后，您的福猫代币预售网站就可以在线访问了！** 🎉
