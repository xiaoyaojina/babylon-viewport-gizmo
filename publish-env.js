// 使用ES模块语法
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// 加载.env文件中的环境变量
dotenv.config();

try {
  // 检查是否已经登录npm
  console.log('检查npm登录状态...');
  try {
    const whoami = execSync('npm whoami --registry https://registry.npmjs.org/', { 
      stdio: ['pipe', 'pipe', 'pipe'] 
    }).toString().trim();
    console.log(`当前已登录npm账号: ${whoami}`);
  } catch (err) {
    // 未登录，需要执行登录
    console.log('未检测到npm登录状态，需要登录...');
    
    // 从环境变量获取npm登录信息
    const NPM_USERNAME = process.env.NPM_USERNAME;
    const NPM_PASSWORD = process.env.NPM_PASSWORD;
    const NPM_EMAIL = process.env.NPM_EMAIL;
    
    // 检查是否所有必要的环境变量都已设置
    if (!NPM_USERNAME || !NPM_PASSWORD || !NPM_EMAIL) {
      console.error('错误: 请在.env文件中设置所有必要的环境变量');
      console.error('请创建.env文件，并设置以下变量:');
      console.error('NPM_USERNAME=你的用户名');
      console.error('NPM_PASSWORD=你的密码');
      console.error('NPM_EMAIL=你的邮箱');
      process.exit(1);
    }
    
    // 执行交互式登录
    console.log('请手动登录npm:');
    execSync('npm login --registry=https://registry.npmjs.org/', { stdio: 'inherit' });
  }
  
  // 获取版本升级类型参数
  const versionArg = process.argv[2] || 'patch';
  
  // 检查版本参数是否有效
  if (!['patch', 'minor', 'major'].includes(versionArg)) {
    console.error('错误: 版本参数无效，必须是 patch、minor 或 major');
    process.exit(1);
  }
  
  // 更新版本号
  console.log(`准备更新版本号 (${versionArg})...`);
  execSync(`npm version ${versionArg} --no-git-tag-version`, {
    stdio: 'inherit'
  });
  
  console.log('准备执行打包...');
  
  // 执行打包
  execSync('pnpm build', {
    stdio: 'inherit'
  });
  
  console.log('打包完成，准备发布...');
  
  // 执行npm发布
  execSync('npm publish --access public', {
    stdio: 'inherit'
  });
  
  console.log('发布流程完成！');
} catch (error) {
  console.error('执行过程中出错:', error.message);
  process.exit(1);
} 