本地 E2E 说明（FAKE_AI=1）

- 运行服务（端口 3001）：

```bash
npm run build
# 使用 Playwright 的 webServer 自动启动（推荐直接跑 e2e）
npm run e2e
```

- 关键环境变量：
  - FAKE_AI=1：启用 /api/chat 的“假模型”，会复读用户最后一条文本，前缀【AI复读】，最长 200 字。
  - NEXT_PUBLIC_E2E=1：前端启用 E2E 模式（自动注入本地用户，关闭默认加密以简化断言，消息持久化到 localStorage）。

- 手动本地启动（可选）：

```bash
# 仅本地体验，不通过 Playwright webServer
cross-env NEXT_PUBLIC_E2E=1 FAKE_AI=1 npm run start
# 打开浏览器访问服务根路径（反代/本地 3001 均可）
```

- 运行 E2E：

```bash
npm run e2e
```

- 失败截图/日志：
  - 截图/视频/trace 会保存在 Playwright 默认输出目录 test-results/。
  - 如需调试可运行：

```bash
npx playwright test --ui
```
