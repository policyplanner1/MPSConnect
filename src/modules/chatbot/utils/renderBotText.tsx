import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { chatbotType } from '../theme/chatbotTypography';

const EMPHASIS_PHRASE = 'My services → Track Status';

type RenderBotTextOptions = {
  baseStyle?: StyleProp<TextStyle>;
  emphasisStyle?: StyleProp<TextStyle>;
  paragraphSpacingStyle?: StyleProp<TextStyle>;
};

function renderRichLine(
  text: string,
  baseStyle: StyleProp<TextStyle>,
  emphasisStyle: StyleProp<TextStyle>,
  keyPrefix: string,
) {
  const parts = text.split(EMPHASIS_PHRASE).reduce<string[]>((acc, part, index, array) => {
    if (part) {
      acc.push(part);
    }
    if (index < array.length - 1) {
      acc.push(EMPHASIS_PHRASE);
    }
    return acc;
  }, []);

  return (
    <Text key={keyPrefix} style={baseStyle}>
      {parts.map((part, index) =>
        part === EMPHASIS_PHRASE ? (
          <Text key={`${keyPrefix}-${index}`} style={emphasisStyle}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export function renderBotParagraphs(
  text: string,
  {
    baseStyle = chatbotType.botBody,
    emphasisStyle = chatbotType.botBodyEmphasis,
    paragraphSpacingStyle,
  }: RenderBotTextOptions = {},
) {
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) =>
      renderRichLine(
        paragraph,
        [baseStyle, index > 0 ? paragraphSpacingStyle : null],
        emphasisStyle,
        paragraph.slice(0, 24),
      ),
    );
}
