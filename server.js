const express = require('express');

const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- 中间件 ----------
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ---------- MongoDB 连接 ----------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ---------- 模型 ----------
const LedStatus = require('./models/LedStatus');
const PidParams = require('./models/PidConfig');   // 需新建模型文件

// ---------- 创建 HTTP 服务器 ----------
const server = http.createServer(app);

// ---------- WebSocket 服务 ----------
const wss = new WebSocketServer({ server, path: '/' });

// 广播函数
function broadcastCommand(cmd) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {   // OPEN
      client.send(cmd);
    }
  });
}

// WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log('ESP-01S connected via WebSocket');

  ws.on('message', async (data) => {
    const msg = data.toString().trim();
    console.log('From ESP:', msg);

    if (msg === 'GET_PID') {
      try {
        let pidDoc = await PidParams.findOne().sort({ updatedAt: -1 });
        if (!pidDoc) pidDoc = new PidParams();   // 使用默认值
        // 发送格式化为 "PID:p,i,d" 的命令
        ws.send(`PID:${pidDoc.p},${pidDoc.i},${pidDoc.d}`);
      } catch (err) {
        ws.send('ERROR: fail to get PID');
      }
    }
    // 可以继续处理其他自定义消息（如传感器数据上报）
  });

  ws.on('close', () => {
    console.log('ESP-01S disconnected');
  });
});

// ---------- REST API ----------

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ================== LED 状态接口 ==================
app.get('/api/led/status', async (req, res) => {
  try {
    let status = await LedStatus.findOne().sort({ lastUpdated: -1 });
    if (!status) status = new LedStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/led/status', async (req, res) => {
  const { state, brightness, color, blinkMode } = req.body;

  if (state && !['on', 'off'].includes(state)) {
    return res.status(400).json({ success: false, message: 'Invalid state' });
  }
  if (brightness !== undefined && (brightness < 0 || brightness > 100)) {
    return res.status(400).json({ success: false, message: 'Invalid brightness' });
  }

  try {
    const update = { lastUpdated: new Date() };
    if (state !== undefined) update.state = state;
    if (brightness !== undefined) update.brightness = brightness;
    if (color !== undefined) update.color = (typeof color === 'object') ? color.hex : color;
    if (blinkMode !== undefined) update.blinkMode = blinkMode;

    const doc = await LedStatus.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
    
    // 根据 state 推送命令
    if (state === 'on') broadcastCommand('LED_ON');
    else if (state === 'off') broadcastCommand('LED_OFF');

    // 处理闪烁模式
    if (blinkMode && blinkMode !== 'none') {
      broadcastCommand(`BLINK_${blinkMode.toUpperCase()}`);
    } else if (blinkMode === 'none') {
      broadcastCommand('BLINK_NONE');
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== PID 参数接口 ==================
// 获取 PID
app.get('/api/pid', async (req, res) => {
  try {
    let pid = await PidParams.findOne().sort({ updatedAt: -1 });
    if (!pid) pid = new PidParams();
    res.json({ success: true, data: pid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 更新 PID
app.post('/api/pid', async (req, res) => {
  const { kp, ki, kd } = req.body;
  if (kp === undefined || ki === undefined || kd === undefined) {
    return res.status(400).json({ success: false, message: 'Missing kp, ki, kd' });
  }

  try {
    const updated = await PidParams.findOneAndUpdate(
      {},
      { $set: { kp, ki, kd, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    // 推送新 PID 给所有在线 ESP-01S
    broadcastCommand(`PID:${updated.kp},${updated.ki},${updated.kd}`);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// ---------- 启动服务器 ----------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});