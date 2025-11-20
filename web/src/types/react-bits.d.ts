declare module 'react-bits/es/ReactBits' {
  export const ReactBits: {
    Platform: any;
    PixelRatio: any;
    StyleSheet: any;
    View: any;
    Text: any;
    Image: any;
    Touchable: any;
    Easing: any;
    Animated: any;
    Dimensions: any;
    inject: (api: Record<string, any>) => void;
  };
}
