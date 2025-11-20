import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Input, InputNumber, Select, Button, Upload, Message, Radio } from '../../ui';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CAMPUSES, CONDITIONS } from '../../utils/constants';
import { api, uploadApi, ASSET_BASE_URL } from '../../services/apiClient';
import styles from './index.module.css';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export const PublishPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      Message.warning('请至少上传一张商品图片');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        title: values.title,
        description: values.description,
        price: values.price,
        condition: values.condition,
        categoryId: values.categoryId,
        campus: values.campus,
        images: fileList
          .map((f) => {
            const url = f.response?.url || (typeof f.url === 'string' ? f.url : undefined);
            if (!url) return undefined;
            if (url.startsWith('/uploads')) {
              return `${ASSET_BASE_URL}${url}`;
            }
            if (url.startsWith('http://') || url.startsWith('https://')) {
              return url;
            }
            return `${ASSET_BASE_URL}/uploads/${url}`;
          })
          .filter(Boolean),
      };

      await api.post('/v1/products', payload);

      Message.success('发布成功！');
      // 失效首页和我的商品缓存（使用全局 QueryClient）
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      // 跳转到“我的商品”，让用户立即看到新发布的商品
      navigate('/my-products');
    } catch (error) {
      Message.error('发布失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = (files: any[]) => {
    const updated = files.map((f: any) => {
      let responseUrl = f.response?.url || f.response?.data?.url;
      const raw = f.originFile || f.file || f.raw;

      if (responseUrl) {
        if (responseUrl.startsWith('/uploads')) {
          responseUrl = `${ASSET_BASE_URL}${responseUrl}`;
        }
        if (f.url && String(f.url).startsWith('blob:') && f.url !== responseUrl) {
          try {
            URL.revokeObjectURL(f.url);
          } catch {}
        }
        return { ...f, url: responseUrl };
      }

      if (!f.url && raw instanceof File) {
        try {
          const localUrl = URL.createObjectURL(raw);
          return { ...f, url: localUrl };
        } catch {
          return f;
        }
      }

      return f;
    });
    setFileList(updated);
  };

  const handleRemove = (file: any) => {
    setFileList((prev) => {
      const next = prev.filter((item) => item.uid !== file.uid);
      if (file.url && String(file.url).startsWith('blob:')) {
        try {
          URL.revokeObjectURL(file.url);
        } catch {}
      }
      return next;
    });
  };

  const customRequest = async (option: any) => {
    const { file, onProgress, onSuccess, onError } = option;
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      const res = await uploadApi.post('/v1/files/upload', formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onProgress?.(percent);
        },
      });
      const url = res.data?.url;
      if (!url) {
        throw new Error('no url');
      }
      onSuccess?.({ url }, file);
    } catch (e) {
      Message.error('图片上传失败');
      onError?.(e);
    }
  };

  return (
    <div className={styles.publishPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>发布闲置</h1>
          <p>填写商品信息，让买家更了解你的商品</p>
        </div>

        <div className={styles.formBox}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <FormItem
              label="商品图片"
              extra="最多上传9张图片，第一张为封面图"
            >
              <div className={styles.uploadSection}>
                <div className={styles.previewList}>
                  {fileList.length === 0 && (
                    <div className={styles.previewPlaceholder}>尚未选择图片</div>
                  )}
                  {fileList.map((file) => {
                    const raw = (file as any).originFile || (file as any).file || (file as any).raw;
                    let src = file.url || file.thumbUrl || file.response?.url || file.response?.data?.url || (raw ? URL.createObjectURL(raw) : undefined);
                    if (src && typeof src === 'string' && src.startsWith('/uploads')) {
                      src = `${ASSET_BASE_URL}${src}`;
                    }
                    if (!src) return null;
                    return (
                      <div className={styles.previewItem} key={file.uid}>
                        <img src={src} alt={file.name || '商品图片'} />
                        <button type="button" className={styles.previewRemove} onClick={() => handleRemove(file)}>
                          <DeleteOutlined style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {fileList.length < 9 && (
                  <Upload
                    listType="picture-card"
                    fileList={fileList as any}
                    onChange={({ fileList }) => handleUploadChange(fileList as any[])}
                    multiple
                    maxCount={9}
                    accept="image/*"
                    customRequest={customRequest}
                    showUploadList={false}
                  >
                    <div className={styles.uploadTriggerCard}>
                      <PlusOutlined style={{ fontSize: 28 }} />
                      <div className={styles.uploadTriggerText}>上传图片</div>
                    </div>
                  </Upload>
                )}
              </div>
            </FormItem>

            <FormItem
              name="title"
              label="商品标题"
              rules={[
                { required: true, message: '请输入商品标题' },
                { max: 50, message: '标题最多50个字符' },
              ]}
            >
              <Input
                placeholder="简洁明了地描述你的商品"
                maxLength={50}
                showCount
                size="large"
              />
            </FormItem>

            <FormItem
              name="description"
              label="商品描述"
              rules={[
                { required: true, message: '请输入商品描述' },
                { max: 500, message: '描述最多500个字符' },
              ]}
            >
              <TextArea
                placeholder="详细描述商品的特点、使用情况、购买渠道等"
                maxLength={500}
                showCount
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </FormItem>

            <FormItem
              name="price"
              label="商品价格"
              rules={[
                { required: true, message: '请输入商品价格' },
                {
                  type: 'number',
                  min: 0.01,
                  message: '价格必须大于0',
                },
              ]}
            >
              <InputNumber
                placeholder="0.00"
                addonBefore="¥"
                min={0.01}
                precision={2}
                size="large"
                style={{ width: '100%' }}
              />
            </FormItem>

            <FormItem
              name="categoryId"
              label="商品分类"
              rules={[{ required: true, message: '请选择商品分类' }]}
            >
              <Radio.Group>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map(cat => {
                    const IconComponent = cat.icon;
                    return (
                      <Radio key={cat.id} value={cat.id}>
                        <div className={styles.categoryOption}>
                          <IconComponent style={{ fontSize: 24 }} />
                          <span>{cat.name}</span>
                        </div>
                      </Radio>
                    );
                  })}
                </div>
              </Radio.Group>
            </FormItem>

            <FormItem
              name="condition"
              label="商品成色"
              rules={[{ required: true, message: '请选择商品成色' }]}
            >
              <Select placeholder="选择商品成色" size="large">
                {CONDITIONS.map(cond => (
                  <Select.Option key={cond.value} value={cond.value}>
                    <span style={{ color: cond.color }}>●</span> {cond.label}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>

            <FormItem
              name="campus"
              label="所在校区"
              rules={[{ required: true, message: '请选择所在校区' }]}
            >
              <Select placeholder="选择所在校区" size="large">
                {CAMPUSES.map(campus => (
                  <Select.Option key={campus} value={campus}>
                    {campus}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>

            <FormItem>
              <div className={styles.submitActions}>
                <Button
                  size="large"
                  onClick={() => navigate(-1)}
                  style={{ width: 120 }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  style={{ width: 200 }}
                >
                  发布商品
                </Button>
              </div>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  );
};

