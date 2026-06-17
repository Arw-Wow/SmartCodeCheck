<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <div class="badge-pill">SmartCodeCheck · 智能代码质量平台</div>
        <h1 class="title">
          智能代码<span class="gradient-text">质量工作台</span>
        </h1>
        <p class="subtitle">
          面向日常开发、教学评测和团队审查，整合<span class="highlight">经典检测、工作台分析、代码对比和批量评测</span>，
          用统一流程完成代码质量发现、复核、沉淀与追踪。
        </p>
        
        <div class="cta-group">
          <router-link to="/workspace" class="btn btn-primary btn-lg">
            打开工作台
          </router-link>
          <router-link to="/detection" class="btn btn-secondary btn-lg">
            经典检测
          </router-link>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-num">Static + AI</span>
            <span class="stat-desc">分析方式</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">Compare</span>
            <span class="stat-desc">方案对比</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">Batch</span>
            <span class="stat-desc">批量评测</span>
          </div>
        </div>
      </div>
      
      <div class="glow-bg glow-1"></div>
      <div class="glow-bg glow-2"></div>
    </section>
    
    <section class="features-section container">
      <h2 class="section-title">核心能力</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="card-icon">🤖</div>
          <h3>灵活分析引擎</h3>
          <p>按场景选择快速静态扫描、LLM 语义审计或混合式分析，在速度、深度和成本之间灵活取舍。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🎯</div>
          <h3>可配置检测标准</h3>
          <p>支持质量维度、自定义规则集和附加指令，把课程评分标准、团队规范或项目红线纳入同一套检测流程。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">⚔️</div>
          <h3>智能 A/B 对比</h3>
          <p>通过双栏视图和维度评分对比两段代码，快速判断正确性、效率、可维护性和鲁棒性差异。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🕒</div>
          <h3>历史与统计</h3>
          <p>保留检测、对比和工作台分析记录，支持查看趋势、复盘问题分布，并在需要时恢复分析现场。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">📊</div>
          <h3>结构化报告</h3>
          <p>将分数、问题、证据、建议和原始事实统一组织，支持导出 JSON、Markdown 或批量结果文件。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🛡️</div>
          <h3>账号与隔离</h3>
          <p>通过账号体系隔离个人记录、模型配置和规则资产，也支持隐私模式减少代码内容留存。</p>
        </div>
      </div>

      <h2 class="section-title upgrade-title">工作流能力</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="card-icon">🔎</div>
          <h3>经典检测</h3>
          <p>保留轻量检测入口，适合快速粘贴代码、选择模型和维度，得到即时评分与文本分析结果。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🧾</div>
          <h3>证据链问题</h3>
          <p>工作台报告围绕问题列表展开，记录严重度、置信度、来源、行号、证据、影响和修复建议。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🧭</div>
          <h3>联动工作台</h3>
          <p>编辑器高亮、问题筛选、质量摘要和点击跳转联动，减少从报告定位到代码修改之间的切换成本。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">📚</div>
          <h3>规则集沉淀</h3>
          <p>把团队规范、课程 Rubric 或安全要求保存为可复用规则集，分析时保留快照便于结果追溯。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">📈</div>
          <h3>统计中心</h3>
          <p>汇总运行次数、平均分、问题类型和维度趋势，帮助观察个人或团队代码质量变化。</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">🧪</div>
          <h3>批量评测</h3>
          <p>上传样本集后逐条运行检测，生成任务记录、汇总指标和导出文件，适合模型对比和实验评估。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 全局容器 */
.home-view {
  overflow-x: hidden;
}

/* --- Hero Section --- */
.hero-section {
  position: relative;
  text-align: center;
  padding: 80px 20px 100px;
  background: radial-gradient(circle at top center, rgba(59, 130, 246, 0.08) 0%, transparent 80%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.badge-pill {
  display: inline-block;
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 24px;
  animation: fadeInDown 0.8s ease;
}

.title {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 24px;
  font-weight: 800;
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.highlight {
  color: var(--text-primary);
  font-weight: 600;
  border-bottom: 1px dashed var(--border-color);
}

/* 按钮组 */
.cta-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-lg {
  padding: 14px 40px;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

/* 数据统计行 */
.stats-row {
  display: inline-flex;
  align-items: center;
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(12px);
  padding: 15px 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--border-color);
}

/* 背景光斑 */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.4;
}
.glow-1 { top: -100px; left: 20%; width: 300px; height: 300px; background: var(--primary-color); }
.glow-2 { top: 100px; right: 20%; width: 250px; height: 250px; background: var(--accent-color); }

/* --- Features Section --- */
.features-section {
  padding: 40px 20px 80px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 50px;
}

.upgrade-title {
  margin-top: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.feature-card {
  background: var(--panel-color);
  padding: 30px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  pointer-events: none;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  width: 60px; height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* 动画 */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .title { font-size: 2.5rem; }
  .stats-row { flex-direction: column; gap: 20px; padding: 20px; width: 80%; }
  .stat-divider { width: 100%; height: 1px; }
  .cta-group { flex-direction: column; }
}
</style>
