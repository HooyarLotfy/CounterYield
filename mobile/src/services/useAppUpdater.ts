import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { config } from '../config/env';

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  minSupportedVersionCode: number;
  apkUrl: string;
  releaseNotes: string;
  publishedAt: number;
}

// Current bundled native version
export const CURRENT_APP_VERSION = {
  versionCode: 1,
  versionName: '1.0.0',
};

export function useAppUpdater() {
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    setIsChecking(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/app/version`, {
        signal: AbortSignal.timeout(6000),
      });
      const json = await response.json();
      if (json.success && json.data) {
        const remote: AppVersionInfo = json.data;
        if (remote.versionCode > CURRENT_APP_VERSION.versionCode) {
          setUpdateInfo(remote);
          setIsUpdateAvailable(true);
        } else {
          setIsUpdateAvailable(false);
        }
      }
    } catch (err) {
      // Offline or network error — fail silently during background check
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const triggerInstall = async () => {
    if (!updateInfo?.apkUrl) return;

    try {
      // 1. Try to open download URL via Android Intent (triggers download and Android PackageInstaller)
      const supported = await Linking.canOpenURL(updateInfo.apkUrl);
      if (supported) {
        await Linking.openURL(updateInfo.apkUrl);
      } else {
        await Linking.openURL(updateInfo.apkUrl);
      }
    } catch (err: any) {
      Alert.alert(
        'Update Error',
        `Unable to open update package: ${err.message || 'Unknown error'}`
      );
    }
  };

  const dismissUpdate = () => {
    setIsDismissed(true);
  };

  return {
    isUpdateAvailable: isUpdateAvailable && !isDismissed,
    updateInfo,
    isChecking,
    checkForUpdates,
    triggerInstall,
    dismissUpdate,
    currentVersion: CURRENT_APP_VERSION,
  };
}
