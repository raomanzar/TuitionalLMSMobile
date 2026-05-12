import React from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts, LetterSpacing, Shadow } from '@/constants/theme';

type Props = {
  first: string;
  last: string;
  color: string;
  size?: number;
  /** Network image. If non-empty, takes precedence over `fallbackImage` and initials. */
  imageUri?: string;
  /** Local image rendered when `imageUri` is empty or missing. Initials are used if neither is set. */
  fallbackImage?: ImageSourcePropType;
};

export function Avatar({ first, last, color, size = 40, imageUri, fallbackImage }: Props) {
  const trimmed = imageUri?.trim();
  const hasNetworkImage = !!trimmed;

  const dimensions = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  if (hasNetworkImage) {
    return (
      <Image
        source={{ uri: trimmed }}
        style={[styles.imageRoot, dimensions]}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={trimmed}
        placeholder={fallbackImage}
        accessibilityIgnoresInvertColors
      />
    );
  }

  if (fallbackImage) {
    return (
      <Image
        source={fallbackImage}
        style={[styles.imageRoot, dimensions]}
        contentFit="cover"
        cachePolicy="memory-disk"
        accessibilityIgnoresInvertColors
      />
    );
  }

  const initials = ((first[0] || '') + (last[0] || '')).toUpperCase();
  return (
    <View style={[styles.root, dimensions]}>
      <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Shadow.control,
    borderWidth: 1,
    borderColor: Colors.iconBoxFrost,
  },
  imageRoot: {
    flexShrink: 0,
    overflow: 'hidden',
    ...Shadow.control,
    borderWidth: 1,
    borderColor: Colors.iconBoxFrost,
  },
  text: {
    color: Colors.text,
    fontFamily: Fonts.semibold,
    letterSpacing: LetterSpacing.normal,
  },
});
