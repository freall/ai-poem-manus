# GitHub Pages 自动部署指南

## 问题排查

如果遇到 `Permission to freall/ai-poem-manus.git denied` 错误，请按以下步骤解决：

### 方案1：使用Personal Access Token（推荐）

1. **创建Personal Access Token**
   - 进入 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo` 和 `workflow`
   - 复制生成的token

2. **添加到仓库Secrets**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `DEPLOY_TOKEN`
   - Value: 粘贴刚才复制的token

3. **更新GitHub Actions工作流**
   ```yaml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       personal_token: ${{ secrets.DEPLOY_TOKEN }}
       publish_dir: ./dist
   ```

### 方案2：启用GITHUB_TOKEN权限

在工作流文件顶部添加权限配置：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 方案3：使用GitHub App Token

1. 在仓库Settings中启用GitHub Pages
2. 确保Actions有写入权限
3. 使用以下配置：

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    force_orphan: true
```

## 启用GitHub Pages

1. 进入仓库 **Settings**
2. 在左侧菜单找到 **Pages**
3. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "gh-pages" 和 "/ (root)"
4. 点击 Save

## 配置自定义域名（可选）

1. 在 Settings → Pages 中
2. 在 "Custom domain" 输入您的域名（如 `ai-poem.freall.com`）
3. 点击 Save
4. 在您的域名DNS设置中添加CNAME记录：
   ```
   ai-poem.freall.com CNAME freall.github.io
   ```

## 查看部署状态

1. 进入仓库 **Actions** 标签
2. 查看最新的工作流运行
3. 如果构建失败，点击查看详细日志

## 常见问题

### Q: 部署后访问404
**A:** 确保 `publish_dir` 指向正确的构建输出目录（通常是 `dist/`）

### Q: 权限错误
**A:** 使用Personal Access Token而不是GITHUB_TOKEN

### Q: 部署很慢
**A:** 这是正常的，首次部署可能需要5-10分钟

### Q: 如何强制重新部署
**A:** 在工作流配置中添加 `force_orphan: true`

## 验证部署

部署完成后，访问以下URL验证：
- GitHub Pages: `https://freall.github.io/ai-poem-manus`
- 自定义域名: `https://ai-poem.freall.com`（如果配置了）

## 本地测试构建

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 检查dist目录是否生成
ls -la dist/
```

## 更多信息

- [peaceiris/actions-gh-pages 文档](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
