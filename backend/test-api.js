const http = require('http');

const BASE_URL = 'localhost';
const PORT = 8080;
const BASE_PATH = '/api';

let testResults = [];
let femaleToken = null;
let maleToken = null;
let femaleUser = null;
let maleUser = null;
let wishId = null;

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: BASE_PATH + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

function logTest(name, passed, message = '') {
  testResults.push({ name, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

async function testHealth() {
  console.log('\n📋 测试健康检查');
  try {
    const res = await makeRequest('GET', '/health');
    logTest('健康检查', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('健康检查', false, e.message);
  }
}

async function testRegister() {
  console.log('\n📋 测试用户注册');
  
  // 测试1: 注册女性用户
  try {
    const femaleUsername = `test_female_${Date.now()}`;
    const res = await makeRequest('POST', '/auth/register', {
      username: femaleUsername,
      password: '123456',
      gender: 'female'
    });
    logTest('注册女性用户', res.status === 201 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      femaleToken = res.data.data.token;
      femaleUser = res.data.data.user;
    }
  } catch (e) {
    logTest('注册女性用户', false, e.message);
  }
  
  // 测试2: 注册男性用户
  try {
    const maleUsername = `test_male_${Date.now()}`;
    const res = await makeRequest('POST', '/auth/register', {
      username: maleUsername,
      password: '123456',
      gender: 'male'
    });
    logTest('注册男性用户', res.status === 201 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      maleToken = res.data.data.token;
      maleUser = res.data.data.user;
    }
  } catch (e) {
    logTest('注册男性用户', false, e.message);
  }
  
  // 测试3: 重复用户名
  try {
    const res = await makeRequest('POST', '/auth/register', {
      username: femaleUser?.username || 'test',
      password: '123456',
      gender: 'female'
    });
    logTest('重复用户名注册失败', res.status === 400, `状态码: ${res.status}`);
  } catch (e) {
    logTest('重复用户名注册失败', false, e.message);
  }
  
  // 测试4: 缺少必填项
  try {
    const res = await makeRequest('POST', '/auth/register', {
      username: '',
      password: '123456'
    });
    logTest('缺少必填项注册失败', res.status === 400, `状态码: ${res.status}`);
  } catch (e) {
    logTest('缺少必填项注册失败', false, e.message);
  }
}

async function testLogin() {
  console.log('\n📋 测试用户登录');
  
  // 测试1: 女性用户登录
  try {
    const res = await makeRequest('POST', '/auth/login', {
      username: femaleUser?.username,
      password: '123456'
    });
    logTest('女性用户登录', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      femaleToken = res.data.data.token;
    }
  } catch (e) {
    logTest('女性用户登录', false, e.message);
  }
  
  // 测试2: 男性用户登录
  try {
    const res = await makeRequest('POST', '/auth/login', {
      username: maleUser?.username,
      password: '123456'
    });
    logTest('男性用户登录', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      maleToken = res.data.data.token;
    }
  } catch (e) {
    logTest('男性用户登录', false, e.message);
  }
  
  // 测试3: 错误密码
  try {
    const res = await makeRequest('POST', '/auth/login', {
      username: femaleUser?.username,
      password: 'wrongpassword'
    });
    logTest('错误密码登录失败', res.status === 401, `状态码: ${res.status}`);
  } catch (e) {
    logTest('错误密码登录失败', false, e.message);
  }
}

async function testPair() {
  console.log('\n📋 测试配对功能');
  
  // 测试1: 绑定配对
  try {
    const res = await makeRequest('POST', '/pair/bind', {
      pair_code: maleUser?.pair_code
    }, femaleToken);
    logTest('绑定配对', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('绑定配对', false, e.message);
  }
  
  // 测试2: 获取配对状态
  try {
    const res = await makeRequest('GET', '/pair/status', null, femaleToken);
    logTest('获取配对状态', res.status === 200 && res.data.success === true && res.data.data.isPaired === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取配对状态', false, e.message);
  }
}

async function testMoods() {
  console.log('\n📋 测试心情功能');
  
  // 测试1: 更新心情
  try {
    const res = await makeRequest('POST', '/moods', {
      mood: '😊',
      note: '今天很开心'
    }, femaleToken);
    logTest('更新心情', res.status === 201 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('更新心情', false, e.message);
  }
  
  // 测试2: 获取当前心情
  try {
    const res = await makeRequest('GET', '/moods/current', null, femaleToken);
    logTest('获取当前心情', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取当前心情', false, e.message);
  }
  
  // 测试3: 获取伴侣心情
  try {
    const res = await makeRequest('GET', '/moods/partner', null, maleToken);
    logTest('获取伴侣心情', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取伴侣心情', false, e.message);
  }
  
  // 测试4: 获取心情历史
  try {
    const res = await makeRequest('GET', '/moods/history', null, femaleToken);
    logTest('获取心情历史', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取心情历史', false, e.message);
  }
}

async function testWishes() {
  console.log('\n📋 测试心愿功能');
  
  // 测试1: 发送心愿
  try {
    const res = await makeRequest('POST', '/wishes', {
      content: '希望能一起去看电影'
    }, femaleToken);
    logTest('发送心愿', res.status === 201 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      wishId = res.data.data.wish.id;
    }
  } catch (e) {
    logTest('发送心愿', false, e.message);
  }
  
  // 测试2: 获取心愿列表
  try {
    const res = await makeRequest('GET', '/wishes', null, femaleToken);
    logTest('获取心愿列表', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取心愿列表', false, e.message);
  }
  
  // 测试3: 更新心愿状态
  if (wishId) {
    try {
      const res = await makeRequest('PUT', `/wishes/${wishId}/status`, {
        status: 'realized'
      }, maleToken);
      logTest('更新心愿状态', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    } catch (e) {
      logTest('更新心愿状态', false, e.message);
    }
    
    // 测试4: 申请修改心愿
    try {
      const res = await makeRequest('PUT', `/wishes/${wishId}/modify`, {
        reason: '想改成一起去旅行'
      }, maleToken);
      logTest('申请修改心愿', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    } catch (e) {
      logTest('申请修改心愿', false, e.message);
    }
    
    // 测试5: 响应修改申请
    try {
      const res = await makeRequest('PUT', `/wishes/${wishId}/modify/respond`, {
        accept: true
      }, femaleToken);
      logTest('响应修改申请', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    } catch (e) {
      logTest('响应修改申请', false, e.message);
    }
  }
}

async function testMessages() {
  console.log('\n📋 测试消息功能');
  
  // 测试1: 获取离线消息
  try {
    const res = await makeRequest('GET', '/messages/cached', null, femaleToken);
    logTest('获取离线消息', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取离线消息', false, e.message);
  }
  
  // 测试2: 标记所有消息已读
  try {
    const res = await makeRequest('PUT', '/messages/read-all', null, femaleToken);
    logTest('标记所有消息已读', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('标记所有消息已读', false, e.message);
  }
}

async function testAuth() {
  console.log('\n📋 测试认证功能');
  
  // 测试1: 获取用户信息
  try {
    const res = await makeRequest('GET', '/auth/me', null, femaleToken);
    logTest('获取用户信息', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('获取用户信息', false, e.message);
  }
  
  // 测试2: 修改密码
  try {
    const res = await makeRequest('PUT', '/auth/password', {
      oldPassword: '123456',
      newPassword: '654321'
    }, femaleToken);
    logTest('修改密码', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('修改密码', false, e.message);
  }
  
  // 测试3: 用新密码登录
  try {
    const res = await makeRequest('POST', '/auth/login', {
      username: femaleUser?.username,
      password: '654321'
    });
    logTest('用新密码登录', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
    if (res.data.success) {
      femaleToken = res.data.data.token;
    }
  } catch (e) {
    logTest('用新密码登录', false, e.message);
  }
}

async function testUnbind() {
  console.log('\n📋 测试解除配对');
  
  // 测试1: 解除配对
  try {
    const res = await makeRequest('DELETE', '/pair/unbind', null, femaleToken);
    logTest('解除配对', res.status === 200 && res.data.success === true, `状态码: ${res.status}`);
  } catch (e) {
    logTest('解除配对', false, e.message);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(t => t.passed).length;
  const total = testResults.length;
  
  testResults.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`总计: ${total} 个测试, 通过: ${passed} 个, 失败: ${total - passed} 个`);
  console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

async function runAllTests() {
  console.log('🚀 开始 WishBridge API 测试\n');
  
  await testHealth();
  
  if (testResults[0]?.passed) {
    await testRegister();
    await testLogin();
    await testPair();
    await testMoods();
    await testWishes();
    await testMessages();
    await testAuth();
    await testUnbind();
  } else {
    console.log('\n❌ 健康检查失败，无法继续测试，请确保后端服务正在运行');
  }
  
  printSummary();
}

runAllTests().catch(console.error);
