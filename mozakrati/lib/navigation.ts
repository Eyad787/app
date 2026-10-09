import { router } from 'expo-router';

/** قفل شاشة النموذج: رجوع لو فيه صفحة قبلها، وإلا للرئيسية (لو الرابط اتفتح مباشرة على الويب) */
export function closeForm() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
