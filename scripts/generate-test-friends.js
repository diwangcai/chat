/**
 * 为账号 1135439197 生成 30 个测试好友
 * 在浏览器控制台中运行此脚本
 */

// 中文姓氏和名字库
const surnames = [
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'
];

const givenNames = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军',
  '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞',
  '平', '刚', '桂英', '海', '燕', '云', '华', '建华', '国强', '志强',
  '雨', '雪', '梅', '春', '夏', '秋', '冬', '晨', '夕', '星',
  '月', '阳', '晴', '蕾', '琳', '欣', '悦', '怡', '婷', '雅'
];

// 生成随机中文姓名
function generateChineseName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const given1 = givenNames[Math.floor(Math.random() * givenNames.length)];
  
  // 随机决定是单名还是双名
  if (Math.random() > 0.3) {
    const given2 = givenNames[Math.floor(Math.random() * givenNames.length)];
    return surname + given1 + given2;
  } else {
    return surname + given1;
  }
}

// 生成 30 个测试好友
function generateTestFriends() {
  const friends = [];
  const usedNames = new Set();
  
  for (let i = 0; i < 30; i++) {
    let name;
    // 确保姓名不重复
    do {
      name = generateChineseName();
    } while (usedNames.has(name));
    
    usedNames.add(name);
    
    friends.push({
      id: `test_${1000 + i}`,
      name: name,
      isOnline: Math.random() > 0.5, // 随机在线状态
      addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // 最近30天内随机时间
    });
  }
  
  return friends;
}

// 添加到指定账号的好友列表
function addTestFriendsToAccount(userId) {
  const testFriends = generateTestFriends();
  
  // 获取现有好友列表
  const existingFriends = JSON.parse(localStorage.getItem(`friends:${userId}`) || '[]');
  
  // 合并好友列表
  const allFriends = [...existingFriends, ...testFriends];
  
  // 保存到 localStorage
  localStorage.setItem(`friends:${userId}`, JSON.stringify(allFriends));
  
  console.log(`✅ 已为账号 ${userId} 添加 ${testFriends.length} 个测试好友:`);
  console.table(testFriends.map(f => ({ 姓名: f.name, 在线: f.isOnline ? '是' : '否' })));
  
  return testFriends;
}

// 清理指定账号的测试好友
function clearTestFriends(userId) {
  const existingFriends = JSON.parse(localStorage.getItem(`friends:${userId}`) || '[]');
  const realFriends = existingFriends.filter(f => !f.id.startsWith('test_'));
  
  localStorage.setItem(`friends:${userId}`, JSON.stringify(realFriends));
  
  console.log(`🗑️ 已清理账号 ${userId} 的测试好友，保留 ${realFriends.length} 个真实好友`);
}

// 执行脚本
console.log('🚀 开始为账号 1135439197 生成测试好友...');
addTestFriendsToAccount('1135439197');

console.log('\n📖 使用说明:');
console.log('- 刷新页面后前往"联系人"页面查看新增的好友');
console.log('- 如需清理测试数据，运行: clearTestFriends("1135439197")');
console.log('- 如需重新生成，运行: addTestFriendsToAccount("1135439197")');

// 导出函数供后续使用
window.generateTestFriends = generateTestFriends;
window.addTestFriendsToAccount = addTestFriendsToAccount;
window.clearTestFriends = clearTestFriends;
