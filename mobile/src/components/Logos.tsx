import React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
}

/**
 * Authentic Kuru DEX Logo Mark
 * Kuru is Monad's central limit order book DEX.
 * Uses official favicon downloaded directly from kuru.io.
 */
export const KuruLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image
        source={require('../../assets/brands/kuru.png')}
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
        resizeMode="contain"
      />
    </View>
  );
};

/**
 * Authentic Perpl DEX Logo Mark
 * Perpl is Monad's native perpetual futures exchange.
 * Uses official geometric 3-pillar glyph from perpl.xyz favicon.
 */
export const PerplLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#836EF9',
          borderRadius: size * 0.25,
          overflow: 'hidden',
          padding: size * 0.15,
        },
        style,
      ]}
    >
      <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 32 32" fill="none">
        <Path d="M9.71373 0H4V31H9.71373V0Z" fill="#FFFFFF" />
        <Path d="M21.5062 15.4392H15.7925V31H21.5062V15.4392Z" fill="#FFFFFF" />
        <Path d="M27.2196 0H21.5059V15.4392H27.2196V0Z" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

/**
 * Monad Official Logo Mark
 * Monad Layer 1 Blockchain token (MON / WMON).
 * Iconic purple circular vortex.
 */
export const MonadLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Defs>
          <LinearGradient id="monadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#836EF9" />
            <Stop offset="100%" stopColor="#4D28D4" />
          </LinearGradient>
        </Defs>
        <Circle cx="20" cy="20" r="20" fill="url(#monadGrad)" />
        {/* Monad Berry Vortex Emblem */}
        <Path
          d="M20 9C13.9249 9 9 13.9249 9 20C9 26.0751 13.9249 31 20 31C26.0751 31 31 26.0751 31 20C31 13.9249 26.0751 9 20 9ZM20 27C16.134 27 13 23.866 13 20C13 16.134 16.134 13 20 13C23.866 13 27 16.134 27 20C27 23.866 23.866 27 20 27Z"
          fill="#FFFFFF"
          fillOpacity={0.2}
        />
        <Path
          d="M20 13.5C16.4101 13.5 13.5 16.4101 13.5 20C13.5 23.5899 16.4101 26.5 20 26.5C23.5899 26.5 26.5 23.5899 26.5 20C26.5 16.4101 23.5899 13.5 20 13.5ZM21.2 16.2C22.8 17 23.8 18.6 23.8 20.4C23.8 22.5 22.1 24.2 20 24.2C18.2 24.2 16.6 23.2 15.8 21.6C16.4 21.8 17.1 21.9 17.8 21.9C20.1 21.9 22 20 22 17.7C22 17.2 21.9 16.7 21.7 16.2C21.5 16.2 21.4 16.2 21.2 16.2Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

/**
 * Authentic Agora AUSD Token Logo Mark
 * Agora Dollar is Monad's institutional native stablecoin.
 * Official asset from Agora token registry.
 */
export const AusdLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image
        source={require('../../assets/brands/ausd.png')}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
    </View>
  );
};

/**
 * Universal Asset/DEX Logo Dispatcher
 */
export const AssetLogo: React.FC<{
  name: 'MON' | 'AUSD' | 'KURU' | 'PERPL' | 'CARRY' | string;
  size?: number;
  style?: any;
}> = ({ name, size = 28, style }) => {
  const upper = name.toUpperCase();
  if (upper === 'KURU') return <KuruLogo size={size} style={style} />;
  if (upper === 'PERPL') return <PerplLogo size={size} style={style} />;
  if (upper === 'MON' || upper === 'WMON') return <MonadLogo size={size} style={style} />;
  if (upper === 'AUSD' || upper === 'USDC') return <AusdLogo size={size} style={style} />;
  return <MonadLogo size={size} style={style} />;
};
