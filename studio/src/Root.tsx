import "./style/fonts";
import { Composition } from "remotion";
import { StyleSheet, styleSheetSchema } from "./compositions/StyleSheet";
import { A4PaperRatio, a4PaperRatioSchema, cues as a4Cues } from "./episodes/001-a4-paper-ratio";
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
      <Composition
        id="001-a4-paper-ratio"
        component={A4PaperRatio}
        schema={a4PaperRatioSchema}
        defaultProps={{ showSafeArea: false }}
        durationInFrames={a4Cues.durationInFrames}
        {...VIDEO}
      />
    </>
  );
};
