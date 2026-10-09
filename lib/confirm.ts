import { Alert } from 'react-native';

export function confirmDelete(onConfirm: () => void, message = 'متأكد إنك عايز تمسح المصروف ده؟') {
  Alert.alert('حذف المصروف', message, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'احذف', style: 'destructive', onPress: onConfirm },
  ]);
}
