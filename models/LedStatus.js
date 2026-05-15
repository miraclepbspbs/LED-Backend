const mongoose = require('mongoose');

const ledStatusSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: ['on', 'off'],
      default: 'off',
    },
    brightness: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    color: {
      type: String,
      default: '#FFFFFF',
    },
    blinkMode: {
      type: String,
      enum: ['none', 'slow', 'fast', 'strobe', 'breath'],
      default: 'none',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt
);

// 我们希望整个数据库只有一条 LED 状态文档，所以使用单例模式
// 这里不设定唯一性，而是通过 findOneAndUpdate + upsert 来实现唯一文档
const LedStatus = mongoose.model('LedStatus', ledStatusSchema);

module.exports = LedStatus;