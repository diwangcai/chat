/* Telegram UI Rescue - 类型定义 */

export interface TgInputProps {
  /** 输入框值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 输入框类型 */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 输入框大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 错误状态 */
  error?: boolean
  /** 错误消息 */
  errorMessage?: string
  /** 标签文本 */
  label?: string
  /** 帮助文本 */
  helpText?: string
  /** 左侧图标 */
  leftIcon?: React.ReactNode
  /** 右侧图标 */
  rightIcon?: React.ReactNode
  /** 变化回调 */
  onChange?: (value: string) => void
  /** 焦点回调 */
  onFocus?: () => void
  /** 失焦回调 */
  onBlur?: () => void
  /** 键盘事件回调 */
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 数据测试ID */
  'data-testid'?: string
  /** ARIA 标签 */
  'aria-label'?: string
  /** ARIA 描述 */
  'aria-describedby'?: string
}

export interface TgButtonProps {
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否全宽 */
  fullWidth?: boolean
  /** 左侧图标 */
  leftIcon?: React.ReactNode
  /** 右侧图标 */
  rightIcon?: React.ReactNode
  /** 点击回调 */
  onClick?: () => void
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset'
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 数据测试ID */
  'data-testid'?: string
  /** ARIA 标签 */
  'aria-label'?: string
  /** 子元素 */
  children: React.ReactNode
}

export interface TgModalProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 是否点击背景关闭 */
  closeOnBackdropClick?: boolean
  /** 是否按ESC关闭 */
  closeOnEscape?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 数据测试ID */
  'data-testid'?: string
  /** 子元素 */
  children: React.ReactNode
}

export interface TgInputRef {
  focus: () => void
  blur: () => void
  select: () => void
  getValue: () => string
  setValue: (value: string) => void
}
