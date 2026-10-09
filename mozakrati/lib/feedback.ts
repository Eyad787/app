/** صوت واهتزاز عند انتهاء جلسة البومودورو */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer | null {
  try {
    if (!player) player = createAudioPlayer(require('@/assets/sounds/bell.wav'));
    return player;
  } catch {
    return null;
  }
}

/** بنحمّل الصوت بدري علشان يشتغل على طول وقت ما نحتاجه */
export function preloadBell() {
  getPlayer();
}

export async function playBell() {
  const p = getPlayer();
  if (!p) return;
  try {
    await p.seekTo(0);
    p.play();
  } catch {
    // الصوت اختياري
  }
}

export function vibrate() {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([200, 100, 200]);
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  Vibration.vibrate(Platform.OS === 'android' ? [0, 300, 150, 300] : 400);
}

export function tapFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}
