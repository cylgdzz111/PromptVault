# PromptVault

<div align="center">

**本地优先、轻量级的 Prompt 版本管理桌面工具**

用于创建、编辑、追踪和对比 Prompt 的演化过程

[![GitHub release](https://img.shields.io/github/v/release/cuiyunlong/PromptVault?style=flat-square)](https://github.com/cuiyunlong/PromptVault/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#-快速开始)

[English](./README_EN.md) | 简体中文

</div>

---

## ✨ 特性

- 📝 **Markdown 编辑器** - 基于 CodeMirror 6 的专业编辑体验
- 📦 **版本管理** - 自动生成版本号（语义化版本），追踪每次修改
- 🔍 **Diff 对比** - 可视化对比任意两个版本的差异
- 💾 **本地存储** - 所有数据存储在本地 `~/.promptlab`，无需云端
- 🎨 **现代 UI** - 基于 Tailwind CSS + shadcn/ui 的精美界面
- ⚡️ **高性能** - Rust 后端 + React 前端，响应迅速
- 🔒 **隐私第一** - 无数据上传，无用户跟踪
- 🌍 **跨平台** - 支持 Windows、macOS 和 Linux

## 🎯 核心场景

- 个人 Prompt 资产管理
- AI 应用开发者管理 Prompt 模板
- Prompt 工程师追踪优化过程
- 团队协作前的 Prompt 本地迭代

## 🚀 快速开始

### 方式一：下载预编译版本（推荐）

前往 [Releases 页面](https://github.com/cuiyunlong/PromptVault/releases) 下载对应平台的安装包：

- **macOS**: `PromptVault_x.x.x_aarch64.dmg` (Apple Silicon) 或 `PromptVault_x.x.x_x64.dmg` (Intel)
- **Windows**: `PromptVault_x.x.x_x64.msi` 或 `.exe`
- **Linux**: `PromptVault_x.x.x_amd64.deb` 或 `.AppImage`

#### macOS 安装步骤

1. 下载 `.dmg` 文件
2. 双击打开，拖动 PromptVault 到 Applications 文件夹
3. 首次运行可能需要在"系统偏好设置 > 隐私与安全性"中允许打开

#### Windows 安装步骤

1. 下载 `.msi` 安装包
2. 双击运行安装向导
3. 完成后在开始菜单找到 PromptVault

#### Linux 安装步骤

```bash
# Debian/Ubuntu
sudo dpkg -i PromptVault_x.x.x_amd64.deb

# 或使用 AppImage（无需安装）
chmod +x PromptVault_x.x.x_amd64.AppImage
./PromptVault_x.x.x_amd64.AppImage
```

### 方式二：从源码构建

#### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/) >= 1.70

#### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/cuiyunlong/PromptVault.git
cd PromptVault

# 安装依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 构建

```bash
# 构建生产版本
npm run tauri build
```

构建完成后，可执行文件位于 `src-tauri/target/release/bundle/`：
- **Windows**: `.exe` 安装包或 `.msi`
- **macOS**: `.dmg` 或 `.app`
- **Linux**: `.deb`、`.AppImage` 或 `.rpm`

## 📖 使用指南

### 创建 Prompt

1. 点击左侧边栏的「新建 Prompt」按钮
2. 填写基本信息：
   - **名称**：Prompt 的唯一标识（如 `summarize`）
   - **描述**：用途说明
   - **模型**：目标模型（如 `gpt-4`）
   - **Temperature**：温度参数 (0-1)
3. 点击「创建」，系统会自动生成初始版本 `0.1.0`

### 编辑 Prompt

- 左侧选择 Prompt，进入编辑器
- 右侧编辑内容（支持 Markdown 语法高亮）
- 修改 Meta 信息（模型、温度、描述）
- 点击「保存新版本」，自动递增版本号（如 `0.1.0` → `0.1.1`）

### 版本历史与对比

1. 点击左下角「版本历史」按钮
2. 查看所有版本的时间线
3. 选择两个版本，点击「对比选中版本」
4. 查看并排 Diff 视图（绿色=新增，红色=删除）

## 🗂️ 数据结构

所有数据存储在用户目录下的 `.promptlab/` 文件夹：

- **Windows**: `C:\Users\{用户名}\.promptlab\`
- **macOS**: `/Users/{用户名}/.promptlab/`
- **Linux**: `/home/{用户名}/.promptlab/`

目录结构：

```
~/.promptlab/
├── index.json              # 全局索引
├── prompts/
│   └── summarize/
│       ├── meta.json       # 元信息（名称、描述、模型等）
│       ├── 0.1.0.md        # 版本 0.1.0 的内容
│       ├── 0.1.1.md        # 版本 0.1.1 的内容
│       └── 0.1.2.md        # 版本 0.1.2 的内容
└── config.json             # 全局配置（预留）
```

### index.json 格式

```json
{
  "summarize": {
    "latest": "0.1.2",
    "created_at": "2026-01-30T10:00:00Z",
    "updated_at": "2026-01-30T12:30:00Z",
    "tags": {
      "stable": "0.1.1"
    }
  }
}
```

### meta.json 格式

```json
{
  "name": "summarize",
  "description": "Article summarization prompt",
  "model": "gpt-4",
  "temperature": 0.7,
  "created_at": "2026-01-30T10:00:00Z"
}
```

## 🏗️ 技术架构

### 前端

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Tailwind CSS + shadcn/ui
- **编辑器**: CodeMirror 6
- **图标**: lucide-react

### 后端

- **语言**: Rust
- **框架**: Tauri 2
- **核心依赖**:
  - `serde` / `serde_json` - 序列化
  - `chrono` - 时间处理
  - `semver` - 版本号解析
  - `similar` - Diff 计算
  - `dirs` - 目录管理

### 项目结构

```
PromptVault/
├── src/                    # React 前端
│   ├── components/
│   │   ├── layout/         # 布局组件（Sidebar）
│   │   ├── prompt/         # Prompt 编辑组件
│   │   ├── version/        # 版本管理组件
│   │   └── ui/             # shadcn/ui 基础组件
│   ├── lib/
│   │   ├── api.ts          # Tauri API 封装
│   │   ├── types.ts        # TypeScript 类型
│   │   └── utils.ts        # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── commands/       # Tauri 命令
│   │   │   ├── prompt.rs   # Prompt CRUD
│   │   │   └── version.rs  # 版本管理
│   │   ├── storage/        # 存储层
│   │   │   ├── index.rs    # 索引管理
│   │   │   └── prompt.rs   # 文件读写
│   │   ├── diff.rs         # Diff 计算
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 🛠️ 开发指南

### 运行开发环境

```bash
npm run tauri dev
```

这会启动：
- Vite 开发服务器（端口 1420）
- Tauri 窗口应用

### 类型检查

```bash
npm run build    # TypeScript 编译检查
```

### Rust 代码检查

```bash
cd src-tauri
cargo check      # 检查编译错误
cargo test       # 运行测试
```

## 🎨 自定义图标

如需自定义应用图标：

1. 准备一个 512x512 或 1024x1024 的 PNG 图标
2. 运行生成命令：
   ```bash
   npx @tauri-apps/cli icon path/to/your-icon.png
   ```
3. 在 `src-tauri/tauri.conf.json` 中启用 bundle：
   ```json
   {
     "bundle": {
       "active": true,
       "icon": [
         "icons/32x32.png",
         "icons/128x128.png",
         "icons/128x128@2x.png",
         "icons/icon.icns",
         "icons/icon.ico"
       ]
     }
   }
   ```

## 📝 Tauri Commands API

### Prompt 管理

```rust
list_prompts() -> Vec<PromptSummary>
get_prompt(name: String, version?: String) -> PromptData
create_prompt(name: String, meta: PromptMetaInput) -> ()
save_prompt(name: String, content: String, meta: PromptMetaInput) -> String
delete_prompt(name: String) -> ()
```

### 版本管理

```rust
list_versions(name: String) -> Vec<VersionInfo>
diff_prompt(name: String, from: String, to: String) -> DiffResult
```

## 📦 发布新版本

如果你是维护者，发布新版本的步骤：

1. **更新版本号**：
   ```bash
   # 更新 package.json 和 tauri.conf.json 中的 version 字段
   # 例如：从 0.1.0 改为 0.2.0
   ```

2. **构建所有平台**：
   ```bash
   npm run tauri build
   ```

3. **创建 Git Tag**：
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

4. **创建 GitHub Release**：
   - 访问 https://github.com/cuiyunlong/PromptVault/releases/new
   - 选择刚创建的 tag
   - 填写 Release 标题和更新日志
   - 上传构建产物：
     - `src-tauri/target/release/bundle/dmg/*.dmg` (macOS)
     - `src-tauri/target/release/bundle/msi/*.msi` (Windows)
     - `src-tauri/target/release/bundle/deb/*.deb` (Linux)
     - `src-tauri/target/release/bundle/appimage/*.AppImage` (Linux)
   - 点击 "Publish release"

## 🤝 贡献

欢迎贡献代码、提交 Issue 或 Feature Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [CodeMirror](https://codemirror.net/) - 强大的代码编辑器
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件库
- [similar](https://github.com/mitsuhiko/similar) - Rust Diff 库

## 🔮 路线图

- [ ] 标签系统（stable、prod、best）
- [ ] 搜索功能
- [ ] 导入/导出（JSON、Markdown）
- [ ] 快捷键支持
- [ ] 深色模式切换
- [ ] 多语言支持
- [ ] 模板市场（可选）

---

<div align="center">

Made with ❤️ by [cuiyunlong](https://github.com/cuiyunlong)

如果这个项目对你有帮助，欢迎 ⭐️ Star！

</div>
