import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  size?: number;
};

const LOGO = require('../../../../assets/images/logo.png');

/** Official LMS logo — used across all auth screens. */
export function BrandMark({ size = 56 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image
        source={LOGO}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={120}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
