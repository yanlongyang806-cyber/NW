## Neverwinter GameServer PVP 版本

该仓库用于托管可编译的 Neverwinter 私服源码，并通过 GitHub Actions 自动生成带全图 PVP 的 `GameServer.exe`。

### 目录结构

```
.
├─src/                # 官方源码（包含我们修改过的 PVP 逻辑）
├─data/defs/...       # 关键配置（Neutral.faction、powertargets.def 等）
├─.github/workflows/  # 自动编译脚本
├─README_GitUpload.md # 当前说明
└─其它资源
```

### 关键修改

1. `src/CrossRoads/Common/Entity/entCritter.c`  
   - 如果配置中没有 `DefaultPlayerFaction`，强制回退到 `Pvp1`。
2. `src/CrossRoads/AppServerLib/LoginServer/aslLogin2_CharacterCreation.c`  
   - 玩家创建/登录时，若未能获取默认阵营，自动设置为 `Pvp1`。
3. `data/defs/critters/Neutral.faction`  
   - `Pvp1` 阵营 `relationship Pvp1 -1 1`，所有玩家互为敌对。
4. `data/defs/config/powertargets.def`  
   - 新增 `PowerTarget Enemy`，让普通攻击/技能都能攻击敌对玩家。

### GitHub Actions 自动编译

`.github/workflows/build.yml` 会在每次 `push` 或手动触发时执行：

1. 使用 Windows 虚拟机安装 MSBuild。
2. 依次编译 `GameServerLib`、`CoreGameServer`、`NNOGameServer`。
3. 上传 `src/Night/GameServer/Release/GameServer.exe` 作为 Artifact。

> 第一次运行可能需要 20~30 分钟，完成后可在 Actions 页面下载新的 `GameServer.exe`。

### 上传步骤

1. 将整个目录（含 `src`、`data`、`.github`）推送到 Git 仓库。
2. 在 GitHub 打开 Actions，点击 `Build GameServer` → `Run workflow`。
3. 等待编译完成，下载 Artifact 中的 `GameServer.exe`。
4. 覆盖 `C:\Night\tools\bin\GameServer.exe`，并部署 `data/defs/...` 中的配置。

如需在本地编译，可运行根目录下的 `自动编译GameServer-启用PVP.bat`（需安装 VS2015+ 带 C++ 工具链）。

