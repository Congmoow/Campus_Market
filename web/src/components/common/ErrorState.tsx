import { Result, Button } from '../../ui';

interface ErrorStateProps {
  title?: string;
  subTitle?: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = '出错了', subTitle = '请稍后重试', onRetry }: ErrorStateProps) {
  return (
    <Result status="error" title={title} subTitle={subTitle}
      extra={onRetry ? <Button type="primary" onClick={onRetry}>重试</Button> : null}
    />
  );
}


