<template>
  <div class="stat-card" :class="`stat-${type}`">
    <div class="stat-icon">
      <i :class="icon"></i>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <h3 class="stat-value">{{ value }}</h3>
      <p class="stat-description" v-if="description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  type: String,
  description: String,
});
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-pending .stat-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-completed .stat-icon {
  background: #d1fae5;
  color: #10b981;
}

.stat-daily .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-monthly .stat-icon {
  background: #fce7f3;
  color: #ec4899;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-description {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
}

@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  .stat-value {
    font-size: 2rem;
  }
}
</style>
