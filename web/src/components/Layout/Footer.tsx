import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h4>关于我们</h4>
          <ul>
            <li><a href="/about">平台介绍</a></li>
            <li><a href="/terms">服务协议</a></li>
            <li><a href="/privacy">隐私政策</a></li>
          </ul>
        </div>
        
        <div className={styles.section}>
          <h4>帮助中心</h4>
          <ul>
            <li><a href="/help/buy">买家指南</a></li>
            <li><a href="/help/sell">卖家指南</a></li>
            <li><a href="/help/safety">交易安全</a></li>
          </ul>
        </div>
        
        <div className={styles.section}>
          <h4>联系我们</h4>
          <ul>
            <li>客服邮箱：support@campus-market.com</li>
            <li>工作时间：9:00 - 18:00</li>
          </ul>
        </div>
        
        <div className={styles.section}>
          <h4>关注我们</h4>
          <div className={styles.social}>
            <span>微信公众号</span>
            <span>新浪微博</span>
          </div>
        </div>
      </div>
      
      <div className={styles.copyright}>
        <p>© 2025 校园二手市场. All rights reserved.</p>
      </div>
    </footer>
  );
};

