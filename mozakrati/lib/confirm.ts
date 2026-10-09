import { Alert, Platform } from 'react-native';

type Options = { title: string; message: string; confirmText?: string; destructive?: boolean };

/** رسالة تأكيد تشتغل على الموبايل والويب (Alert مابيشتغلش على الويب) */
export function confirmAsync({ title, message, confirmText = 'تمام', destructive = true }: Options): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'إلغاء', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
