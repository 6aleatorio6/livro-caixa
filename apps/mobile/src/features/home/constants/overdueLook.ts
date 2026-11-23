import { AlarmClock } from 'lucide-react-native';

const MARK_COLOR = 'errorContainer';
const ICON_COLOR = 'onErrorContainer';

/**
 * Como a conta atrasada se desenha onde aparece: o relógio, a marca e o selo "Atrasada", nas cores `errorContainer`
 * do tema. O `Notice` tem o tom de erro por conta própria, por ser um componente genérico.
 */
export const OVERDUE_LOOK = {
  icon: AlarmClock,
  markColor: MARK_COLOR,
  iconColor: ICON_COLOR,
  badge: { label: 'Atrasada', background: MARK_COLOR, color: ICON_COLOR },
} as const;
