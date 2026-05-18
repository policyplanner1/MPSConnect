declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { ComponentType } from 'react';

  const Icon: ComponentType<any>;
  export default Icon;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { ComponentType } from 'react';

  const Icon: ComponentType<any>;
  export default Icon;
}

declare module '@env' {
  export const API_BASE_URL: string | undefined;
  export const IMAGE_BASE_URL: string | undefined;
}
