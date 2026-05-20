# SiX IoT WeChat Mini Program Sample

A production-ready reference implementation for a WeChat Mini Program (微信小程序) built with **TypeScript**. This sample project demonstrates a clean architecture for integrating and federating native WeChat authentication with **[SiX IDaaS & IAM](https://web.iam.shuhenglianchang.com/index)**, allowing enterprises to securely bridge WeChat identity profiles into their cloud application ecosystem.

> [!TIP]
> We highly recommend reviewing the [WeChat Mini Program Identity Provider (IdP) Federation Guide](https://doc.iam.shuhenglianchang.com/zh/quick-start/idp-wechat-miniapp) to understand the underlying OAuth2/OIDC exchange flows before configuring authentication states.

**Project Status:** Alpha / Minimal Blueprint — Engineered as a foundational boilerplate for custom enterprise Mini Program development.

---

## Prerequisites

Before opening the workspace, ensure you have the following toolkits configured on your development machine:

*   **Node.js:** `>= 14.x` (LTS recommended)
*   **IDE:** Official [WeChat Developer Tools (微信开发者工具)](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) installed and configured with a valid `AppID`.
*   **Language Runtime:** TypeScript (`tsc`) compiler accessible locally.

---

## Quick Start

Follow these steps to initialize the environment and run the project:

### 1. Install Workspace Typings & Dependencies
Navigate to the root directory and install development type definitions:
```bash
npm install
```

### 2. Import into WeChat Developer Tools
1. Launch the **WeChat Developer Tools**.
2. Select **Mini Program (小程序)** and click the **+ (Add)** icon.
3. Choose the repository root folder as the project directory.
4. Input your designated WeChat `AppID` (or select test mode if you are evaluating locally).

### 3. Initialize TypeScript Compilation
The codebase leverages modern TypeScript configuration. To enable reactive background type checking and incremental compilation during development, run:
```bash
# Compile and watch for file modifications
npx tsc -w
```

### 4. Debug and Deploy
Utilize the built-in simulator within the WeChat Developer Tools to preview logic, inspect network payloads, track authentication states, and ultimately compile code for staging or production release distribution.

---

## Project Architecture

The project maintains a structured directory layout optimized for modularity and strict typing compliance:

```text
├── miniprogram/        # Main application source space (pages, structural components, app.ts)
├── miniapp/            # Platform-specific native packaging models and container metadata
├── utils/              # Reusable functional helpers and core business modules
├── typings/            # Managed TypeScript declaration files mapping WeChat target APIs
├── project.miniapp.json # Main Mini Program runtime manifest, capability configurations, and SDK versions
├── package.json        # Build configurations, compiler definitions, and development dependencies
└── LICENSE             # Apache-2.0 open-source legal definitions
```

---

## Configuration Management

*   **App Metadata:** Before executing a release build or generating custom distribution packages, open `project.miniapp.json` to customize your application `name`, baseline `version`, and platform-specific compilation parameters.

*   **TypeScript Typings:** The codebase comes pre-bundled with `miniprogram-api-typings` as a development dependency. This provides auto-completion and compile-time validation for native WeChat APIs (`wx.login`, `wx.request`, etc.) without requiring external casting overrides.

> [!NOTE]
> Compilation pipelines, bundle optimization, and remote assets upload are directly managed by the WeChat Developer Tools interface, maintaining a zero-overhead footprint in `package.json`.

---

## Contributing & License

Contributions, performance optimization pull requests, or advanced build script additions (such as CI/CD automated deployment rules) are welcome.

*   **License:** Distributed under the **Apache-2.0 License**. See the accompanying [LICENSE](LICENSE) file for complete legal terminology.

---

## Contact & Support

For technical queries, federated architectural deep-dives, or private deployment feedback:

*   **Engineering Support:** stephen.yu@six-inno.cn
*   **Enterprise Service:** service@six-inno.cn