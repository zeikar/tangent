import "./style/fonts";
import { Composition, Folder, Still } from "remotion";
import { AVATAR, Avatar } from "./brand/Avatar";
import { BANNER, Banner, bannerSchema } from "./brand/Banner";
import { LOGO_UNIT, LogoStill } from "./brand/Logo";
import { WATERMARK, Watermark } from "./brand/Watermark";
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
      <Folder name="brand">
        <Still id="Logo" component={LogoStill} width={LOGO_UNIT} height={LOGO_UNIT} />
        <Still id="Avatar" component={Avatar} {...AVATAR} />
        <Still id="Watermark" component={Watermark} {...WATERMARK} />
        <Still
          id="Banner"
          component={Banner}
          schema={bannerSchema}
          defaultProps={{ showSafeArea: false }}
          {...BANNER}
        />
      </Folder>
    </>
  );
};
