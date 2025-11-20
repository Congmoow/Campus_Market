import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, Checkbox, Select, Message } from '../../ui';
import {
  UserAddOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { api } from '../../services/apiClient';
import { userService } from '../../services/userService';
import { CAMPUSES } from '../../utils/constants';
import { useAuthModalStore } from '../../store/authModalStore';
import styles from './index.module.css';

const FormItem = Form.Item;

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ visible, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  const { closeModal } = useAuthModalStore();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!visible) return;
    const pending = window.sessionStorage.getItem('pendingRedirect');
    if (pending) {
      setActiveTab('login');
    }
  }, [visible]);

  const handleLogin = async (values: any) => {
    setLoginLoading(true);
    
    try {
      const { data } = await api.post('/v1/auth/login', {
        username: values.username,
        password: values.password,
      });

      if (!data?.token) {
        throw new Error('登录失败');
      }

      setToken(data.token);
      try {
        const me = await userService.getMe();
        setUser(me);
      } catch {
        // 回退到登录返回的用户信息（可能不含完整头像）
        setUser(data.user);
      }
      
      Message.success('登录成功！');
      loginForm.resetFields();
      const pending = window.sessionStorage.getItem('pendingRedirect');
      if (pending) {
        window.sessionStorage.removeItem('pendingRedirect');
        navigate(pending);
      }
      onClose();
      closeModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '登录失败，请检查用户名和密码';
      Message.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };


  const handleRegister = async (values: any) => {
    setRegisterLoading(true);
    
    try {
      await api.post('/v1/auth/register', {
        email: values.email,
        nickname: values.nickname,
        password: values.password,
        phone: values.phone,
        campus: values.campus,
      });

      Message.success('注册成功！请登录');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '注册失败，请稍后重试';
      Message.error(msg);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleClose = () => {
    loginForm.resetFields();
    registerForm.resetFields();
    const pending = window.sessionStorage.getItem('pendingRedirect');
    if (pending) {
      window.sessionStorage.removeItem('pendingRedirect');
    }
    setActiveTab(defaultTab);
    onClose();
    closeModal();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleClose}
      footer={null}
      className={styles.authModal}
      style={{ width: 480 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'login' | 'register')}
        className={styles.tabs}
        items={[
          {
            key: 'login',
            label: '登录',
            children: (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h2>欢迎回来</h2>
                  <p>登录校园二手市场</p>
                </div>

                <Form
                  form={loginForm}
                  layout="vertical"
                  onFinish={handleLogin}
                  autoComplete="off"
                >
                  <FormItem
                    name="username"
                    rules={[{ required: true, message: '请输入用户名/邮箱/手机号' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名/邮箱/手机号"
                      size="large"
                    />
                  </FormItem>

                  <FormItem
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6位' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                      size="large"
                    />
                  </FormItem>

                  <div className={styles.formOptions}>
                    <FormItem name="remember" noStyle valuePropName="checked">
                      <Checkbox>记住我</Checkbox>
                    </FormItem>
                  </div>

                  <FormItem>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loginLoading}
                    >
                      登录
                    </Button>
                  </FormItem>
                </Form>
              </div>
            ),
          },
          {
            key: 'register',
            label: '注册',
            children: (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h2>加入我们</h2>
                  <p>注册校园二手市场账号</p>
                </div>

                <Form
                  form={registerForm}
                  layout="vertical"
                  onFinish={handleRegister}
                  autoComplete="off"
                >
                  <FormItem
                    name="nickname"
                    label="昵称"
                    rules={[
                      { required: true, message: '请输入昵称' },
                      { min: 2, message: '昵称至少2个字符' },
                      { max: 20, message: '昵称最多20个字符' },
                    ]}
                  >
                    <Input
                      prefix={<UserAddOutlined />}
                      placeholder="输入昵称"
                      size="large"
                    />
                  </FormItem>

                  <FormItem
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入正确的邮箱格式' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="输入邮箱"
                      size="large"
                    />
                  </FormItem>

                  <FormItem
                    name="phone"
                    label="手机号（可选）"
                    rules={[
                      {
                        validator: async (_rule, value) => {
                          if (!value) return Promise.resolve();
                          if (!/^1[3-9]\d{9}$/.test(value)) {
                            return Promise.reject(new Error('请输入正确的手机号'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="输入手机号"
                      size="large"
                    />
                  </FormItem>

                  <FormItem
                    name="campus"
                    label="所在校区（可选）"
                  >
                    <Select 
                      placeholder="选择校区" 
                      size="large"
                      className="campus-select"
                    >
                      {CAMPUSES.map(campus => (
                        <Select.Option key={campus} value={campus}>
                          {campus}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormItem>

                  <FormItem
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6位' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="输入密码（至少6位）"
                      size="large"
                    />
                  </FormItem>

                  <FormItem
                    name="confirmPassword"
                    label="确认密码"
                    rules={[
                      { required: true, message: '请确认密码' },
                      {
                        validator: async (_rule, value) => {
                          if (value !== registerForm.getFieldValue('password')) {
                            return Promise.reject(new Error('两次密码输入不一致'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="再次输入密码"
                      size="large"
                    />
                  </FormItem>

                  <FormItem>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={registerLoading}
                    >
                      注册
                    </Button>
                  </FormItem>
                </Form>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}

