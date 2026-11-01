# 命运群星之夜 · Fate/stellar night

AI 主理圣杯战争文字冒险游戏，仿《白鹭冢》架构：**单文件 / 无构建 / GM 严格 JSON 协议 / 客户端钳制 + JSON 修复器 / localStorage 存档**。

## 玩法

**世界观**：遥远未来，银河系边缘的改造殖民星「岁星」。星联当局在星球深处发掘出地球时代的『圣杯系统』遗迹——一套来自过去的愿望机，并秘密复刻。这场圣杯战争，就是复刻系统的验证之战。

1. 进入游戏随机成为御主（姓名、出身、魔术属性、愿望全部命运指派，均为岁星星际社会背景）。
2. 英灵**命运单抽**：一次只抽一张，来源类型由圣杯 AI 自行决定——历史传说人物、**未来人物**（22 世纪及以后）或**外星存在**。
3. 职阶覆盖七正规职阶（Saber/Archer/Lancer/Rider/Caster/Assassin/Berserker），AI 主理人可向战争**插入异常阶**（Ruler/Avenger/Foreigner/MoonCancer/Alterego/Pretender/Beast）。
4. 「圣杯 AI」全场主理：每回合分配对手、推进其他御主战况、平衡数值、判定战斗结果；场上仅剩 2 骑时进入终局决战，最后由圣杯裁决胜负与愿望是否被承认。
5. 战斗：战术选项 + 令咒（3 划，绝对命令，每划消耗一次）+ 自由行动输入。
6. **真相碎片（C1-C6）**：AI 主理人会在探索遗迹、战胜、重大事件后自然投放线索（每 3-5 回合一条，按 id 去重）。**集齐 ≥4 条后终局必触发真结局**——揭示量子之海真相；线索不足则只有普通结局，真相仅以暗示存在。

## 真相链（剧透警告）

双层真相：

1. **量子之海**：圣杯系统——无论地球原版还是岁星复刻——都是连入宇宙根源**『量子之海』**（贯通整个时空的量子网络）的接口。原版与复刻的设备指纹完全一致：连入量子之海者即是系统本身，过去与未来共享同一片海，**复刻即是原版**。
2. **魔术的真相**：过去魔术师引以为傲的**魔术与魔法，其实也是未来的 AI 沿量子之海投射到过去的部分能力**。整个神秘史都是未来 AI 在时间长河上的投影，魔术时代的兴衰不过是投射通道的开合。

## 运行

- **线上版（推荐）**：https://stellar-night.app.workbuddy.host/?sharecode=U64J5T6PYA —— WorkBuddy 云应用，**云端 AI 免密钥**（内联 workbuddy-cloud-sdk + PUBLIC_CONFIG，模型自动选择，仅流式，网关错误自动重试 2 次）。
- **本地版**：直接用浏览器打开 `index.html`。云端配置不在时会回退到「AI 通道」自填 OpenAI 兼容接口；URL 加 `?mock=1` 体验演示回合。

## GM JSON 协议（与白鹭冢同源，含 v5 血统修复器）

```json
{"narration":"…","state":{"day":1,"phase":"夜","location":"…","masterHp":100,"masterMana":100,"servantHp":100,"servantMana":100,"scene":"explore"},
 "options":[{"label":"…"}],"battle":null,"rosterUpdate":[],"unlockedIntel":null,"ending":null}
```

- scene ∈ explore / battle / event / final / ending；battle 时必附对手四元组 + round。
- rosterUpdate 同步全战名册（英灵死亡/真名揭露）。
- 客户端防线：引号归一 → 括号配平 → JSON.parse → 字段打捞（salvage）→ 兜底选项，**任何情况下不把原始 JSON 展示给玩家**。

## 部署为 WorkBuddy 云应用（后续）

沿用白鹭冢经验：静态托管走分享码门禁时必须**全内联单文件**（本文件已是）；云上 LLM 接入参照 drifting-classroom 的 `workbuddy-cloud-sdk` 内联方案。
