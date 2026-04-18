// 在 AuthService 类中添加这个私有方法
export function parseDeviceInfo(userAgent: string): string {
  if (!userAgent || userAgent === 'unknown') {
    return 'Unknown Device';
  }

  // 提取浏览器信息
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // 提取操作系统信息
  let os = 'Unknown OS';
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows 10/11';
  } else if (userAgent.includes('Windows NT')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  // 提取设备类型
  let deviceType = 'Desktop';
  if (userAgent.includes('Mobile')) {
    deviceType = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'Tablet';
  }

  return `${browser} on ${os} (${deviceType})`;
}