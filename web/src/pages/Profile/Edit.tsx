import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Message, Upload, Avatar } from '../../ui';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { userService } from '../../services/userService';
import { uploadApi, ASSET_BASE_URL } from '../../services/apiClient';

export const ProfileEditPage = () => {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [cover, setCover] = useState<string | undefined>(user?.coverImage);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nickname: user.nickname,
        campus: user.campus,
        phone: user.phone,
        avatar: user.avatar,
        coverImage: user.coverImage,
      });
      setAvatar(user.avatar || undefined);
      setCover(user.coverImage || undefined);
    }
  }, [user, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const avatarPath = values.avatar || (avatar ? avatar.replace(ASSET_BASE_URL, '') : undefined);
      const coverPath = values.coverImage || (cover ? cover.replace(ASSET_BASE_URL, '') : undefined);
      const updated = await userService.updateMe({ ...values, avatar: avatarPath, coverImage: coverPath });
      setUser(updated);
      Message.success('保存成功');
      navigate('/profile');
    } catch {
      Message.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 16px' }}>
      <Card title="编辑个人资料">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <Avatar size={72} style={{ backgroundColor: '#f2f3f5', color: '#1d2129' }}>
            {avatar ? <img src={avatar} alt={user?.nickname || '用户'} /> : (user?.nickname?.slice(0, 1) || <UserOutlined />)}
          </Avatar>
          <Upload
            maxCount={1}
            showUploadList={false}
            customRequest={async (options) => {
              const { file, onProgress, onSuccess, onError } = options;
              const formData = new FormData();
              formData.append('file', file as File);
              try {
                const { data } = await uploadApi.post('/v1/files/upload', formData, {
                  onUploadProgress: (evt) => {
                    if (evt.total) {
                      const percent = Math.round((evt.loaded / evt.total) * 100);
                      onProgress?.({ percent }, file as any);
                    }
                  },
                });
                const absoluteUrl = `${ASSET_BASE_URL}${data.url}`;
                setAvatar(absoluteUrl);
                form.setFieldValue('avatar', data.url);
                onSuccess?.({ url: absoluteUrl }, file as any);
              } catch (err) {
                Message.error('上传失败，请稍后重试');
                onError?.(err as Error);
              }
            }}
          >
            <Button
              type="default"
              size="small"
              icon={<UploadOutlined />}
              style={{ borderRadius: 999, padding: '0 16px' }}
            >
              上传头像
            </Button>
          </Upload>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>个人封面</div>
          {cover && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={cover}
                alt="封面预览"
                style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 160 }}
              />
            </div>
          )}
          <Upload
            maxCount={1}
            showUploadList={false}
            customRequest={async (options) => {
              const { file, onProgress, onSuccess, onError } = options;
              const formData = new FormData();
              formData.append('file', file as File);
              try {
                const { data } = await uploadApi.post('/v1/files/upload', formData, {
                  onUploadProgress: (evt) => {
                    if (evt.total) {
                      const percent = Math.round((evt.loaded / evt.total) * 100);
                      onProgress?.({ percent }, file as any);
                    }
                  },
                });
                const absoluteUrl = `${ASSET_BASE_URL}${data.url}`;
                setCover(absoluteUrl);
                form.setFieldValue('coverImage', data.url);
                onSuccess?.({ url: absoluteUrl }, file as any);
              } catch (err) {
                Message.error('上传失败，请稍后重试');
                onError?.(err as Error);
              }
            }}
          >
            <Button
              type="default"
              size="small"
              icon={<UploadOutlined />}
              style={{ borderRadius: 999, padding: '0 16px' }}
            >
              上传封面
            </Button>
          </Upload>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}> 
            <Input maxLength={20} allowClear />
          </Form.Item>
          <Form.Item name="campus" label="所在校区">
            <Input allowClear />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input allowClear />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/profile')}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>保存</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};


