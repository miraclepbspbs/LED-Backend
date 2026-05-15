const mongoose = require('mongoose');

const pidConfigSchema = new mongoose.Schema(
  {
    kp: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ki: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    kd: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sampleTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    targetValue: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt
);

// 我们希望整个数据库只有一条 PID 配置文档，所以使用单例模式
const PidConfig = mongoose.model('PidConfig', pidConfigSchema);

module.exports = PidConfig;