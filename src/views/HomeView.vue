<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <div class="badge-pill">SmartCodeCheck · 智能代码质量平台</div>
        <h1 class="title">
          智能代码<span class="gradient-text">质量工作台</span>
        </h1>
        <p class="subtitle">
          面向日常开发、教学评测和团队审查，整合<span class="highlight">工作台分析、代码对比、批量评测和统计追踪</span>，
          用统一流程完成代码质量发现、复核、沉淀与追踪。
        </p>
        
        <div class="cta-group">
          <router-link to="/workspace" class="btn btn-primary btn-lg">
            打开工作台
          </router-link>
          <router-link to="/comparison" class="btn btn-secondary btn-lg">
            代码对比
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
      <section class="feature-group">
        <div class="group-head">
          <h2 class="section-title">主要入口</h2>
          <p>从深度审查到方案对比，覆盖代码质量评估中最常用的两类操作。</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="card-icon">🧭</div>
            <h3>工作台分析</h3>
            <p>在编辑器中编写或粘贴代码，选择语言、维度、分析模式和规则集，生成可定位到代码的质量报告。</p>
          </div>

          <div class="feature-card">
            <div class="card-icon">⚔️</div>
            <h3>代码对比</h3>
            <p>对两段实现进行 A/B 分析，从正确性、效率、可维护性、鲁棒性等维度辅助重构和选型判断。</p>
          </div>
        </div>
      </section>

      <section class="feature-group">
        <div class="group-head">
          <h2 class="section-title">规则与模型</h2>
          <p>围绕不同评审场景配置模型、质量维度和项目规范。</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="card-icon">🤖</div>
            <h3>分析模式与模型</h3>
            <p>支持快速、智能、深度等分析模式，可选择云端模型或本地 OpenAI 兼容接口，平衡速度、效果和隐私。</p>
          </div>

          <div class="feature-card">
            <div class="card-icon">📚</div>
            <h3>规则集与维度</h3>
            <p>将课程 Rubric、团队代码规范或安全要求整理成规则集，并结合质量维度和附加指令约束分析结果。</p>
          </div>
        </div>
      </section>

      <section class="feature-group">
        <div class="group-head">
          <h2 class="section-title">结果解释</h2>
          <p>让检测结果能被复核、定位和交付，而不是停留在一段笼统文本。</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="card-icon">🧾</div>
            <h3>证据链问题</h3>
            <p>每个问题记录严重度、置信度、来源、行号、证据、影响和建议，便于复核结论和安排修复。</p>
          </div>

          <div class="feature-card">
            <div class="card-icon">📊</div>
            <h3>质量摘要与导出</h3>
            <p>汇总分数、问题分布、静态事实和修复建议，支持导出 Markdown 或结构化结果用于归档和分享。</p>
          </div>
        </div>
      </section>

      <section class="feature-group">
        <div class="group-head">
          <h2 class="section-title">追踪与交付</h2>
          <p>面向复盘、实验和团队评测，把单次分析沉淀为可追踪记录。</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="card-icon">🕒</div>
            <h3>历史与统计</h3>
            <p>汇总运行次数、平均分、问题数量、严重度分布和维度趋势，观察个人或团队质量变化。</p>
          </div>

          <div class="feature-card">
            <div class="card-icon">🧪</div>
            <h3>批量检测与导出</h3>
            <p>上传 JSONL、多行 JSON 或 JSON 数组批量运行样本，生成任务记录，并导出 JSON、CSV 或 Markdown 结果。</p>
          </div>
        </div>
      </section>
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
  display: grid;
  gap: 54px;
}

.feature-group {
  display: grid;
  gap: 18px;
}

.group-head {
  display: grid;
  gap: 10px;
  max-width: 760px;
}

.section-title {
  font-size: 2rem;
  margin: 0;
}

.group-head p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .features-grid { grid-template-columns: 1fr; }
}
</style>
