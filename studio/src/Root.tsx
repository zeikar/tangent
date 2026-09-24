import "./style/fonts";
import { Composition } from "remotion";
import { StyleSheet, styleSheetSchema } from "./compositions/StyleSheet";
import { VIDEO } from "./style/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StyleSheet"
        component={StyleSheet}
        schema={styleSheetSchema}
        defaultProps={{ showSafeArea: false }}
        durationInFrames={3 * VIDEO.fps}
        {...VIDEO}
      />
    </>
  );
};
