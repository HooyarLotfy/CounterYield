import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
}

/**
 * Authentic Kuru DEX Logo Mark
 * Kuru is Monad's central limit order book DEX.
 * Vibrant fiery orange/coral faceted geometric icon.
 */
export const KuruLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Defs>
          <LinearGradient id="kuruGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B35" />
            <Stop offset="100%" stopColor="#E63946" />
          </LinearGradient>
          <LinearGradient id="kuruFacet" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFA07A" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#FF4500" stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        {/* Background rounded squircle */}
        <Rect width="40" height="40" rx="11" fill="url(#kuruGrad)" />
        {/* Geometric Origami K / CLOB order book facets */}
        <Path
          d="M13 10H17V30H13V10Z"
          fill="#FFFFFF"
        />
        <Path
          d="M17 21L26.5 11H31.5L20.8 22.2L17 21Z"
          fill="#FFFFFF"
        />
        <Path
          d="M19.5 20.8L31.5 29H26L17 22.5L19.5 20.8Z"
          fill="#FFFFFF"
        />
        <Circle cx="28" cy="19.5" r="2.2" fill="url(#kuruFacet)" />
      </Svg>
    </View>
  );
};

/**
 * Authentic Perpl DEX Logo Mark
 * Perpl is Monad's native perpetual futures exchange.
 * Vivid purple/violet ribbon infinity diamond.
 */
export const PerplLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Defs>
          <LinearGradient id="perplGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#836EF9" />
            <Stop offset="100%" stopColor="#5E3FE6" />
          </LinearGradient>
          <LinearGradient id="perplNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00F0FF" />
            <Stop offset="100%" stopColor="#836EF9" />
          </LinearGradient>
        </Defs>
        {/* Background squircle */}
        <Rect width="40" height="40" rx="11" fill="url(#perplGrad)" />
        {/* Perpl Perp Loop / Geometric P Emblem */}
        <Path
          d="M14 11H22.5C26.0899 11 29 13.9101 29 17.5C29 21.0899 26.0899 24 22.5 24H18.5V29H14V11Z"
          fill="#FFFFFF"
          fillOpacity={0.95}
        />
        <Path
          d="M18.5 15.5V19.5H22C23.1046 19.5 24 18.6046 24 17.5C24 16.3954 23.1046 15.5 22 15.5H18.5Z"
          fill="#5E3FE6"
        />
        <Circle cx="29" cy="27" r="2.5" fill="#00F0FF" />
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
 * Agora AUSD Logo Mark
 * Agora Dollar is Monad's institutional native stablecoin.
 * Rich emerald teal coin with Agora A monogram.
 */
export const AusdLogo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Defs>
          <LinearGradient id="ausdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#059669" />
            <Stop offset="100%" stopColor="#047857" />
          </LinearGradient>
        </Defs>
        <Circle cx="20" cy="20" r="20" fill="url(#ausdGrad)" />
        <Circle cx="20" cy="20" r="17.5" stroke="#34D399" strokeWidth="1" strokeOpacity={0.4} />
        {/* AUSD stylized 'A' */}
        <Path
          d="M20 11L13 27.5H16.8L18.4 23.5H21.6L23.2 27.5H27L20 11ZM19.2 20.2L20 16.8L20.8 20.2H19.2Z"
          fill="#FFFFFF"
        />
        <Circle cx="20" cy="29" r="1.5" fill="#34D399" />
      </Svg>
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
