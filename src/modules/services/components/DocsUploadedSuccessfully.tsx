import React, { useMemo } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

const UPLOAD_SUCCESS_GIF = require('../../../assets/images/Upload.gif');

type DocsUploadedSuccessfullyProps = {
  width?: number;
  height?: number;
  style?: ViewStyle;
};

function buildGifHtml(uri: string): string {
  const safeUri = uri.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    </style>
  </head>
  <body>
    <img src="${safeUri}" alt="Documents uploaded successfully" />
  </body>
</html>`;
}

/**
 * Animated upload-success GIF.
 * WebView is used because Android `Image` needs extra Fresco GIF libs and
 * percentage-based Image sizing often renders at 0×0 in flex layouts.
 */
export default function DocsUploadedSuccessfully({
  width = 280,
  height = 280,
  style,
}: DocsUploadedSuccessfullyProps) {
  const uri = useMemo(() => Image.resolveAssetSource(UPLOAD_SUCCESS_GIF)?.uri ?? '', []);

  const html = useMemo(() => (uri ? buildGifHtml(uri) : ''), [uri]);

  if (!uri) {
    return <View style={[styles.wrap, { width, height }, style]} />;
  }

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <WebView
        source={{ html, baseUrl: '' }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
        androidLayerType="hardware"
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
