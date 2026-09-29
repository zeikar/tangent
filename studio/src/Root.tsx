import "./style/fonts";
import { Composition, Folder, Still } from "remotion";
import { AVATAR, Avatar } from "./brand/Avatar";
import { BANNER, Banner, bannerSchema } from "./brand/Banner";
import { LOGO_UNIT, LogoStill } from "./brand/Logo";
import { WATERMARK, Watermark } from "./brand/Watermark";
import { StyleSheet, styleSheetSchema } from "./compositions/StyleSheet";
import { a4Cues, a4PaperRatio } from "./episodes/001-a4-paper-ratio";
import { moonCues, moonRotation } from "./episodes/002-moon-rotation";
import { mirrorCues, mirrorLeftRight } from "./episodes/003-mirror-left-right";
import { MeasureTex, measureTexSchema } from "./probe/MeasureTex";
import { episodeSchema } from "./storyboard/Episode";
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
        component={a4PaperRatio.Component}
        schema={episodeSchema}
        calculateMetadata={a4PaperRatio.calculateMetadata}
        defaultProps={{ showSafeArea: false }}
        durationInFrames={a4Cues.durationInFrames}
        {...VIDEO}
      />
      <Composition
        id="002-moon-rotation"
        component={moonRotation.Component}
        schema={episodeSchema}
        calculateMetadata={moonRotation.calculateMetadata}
        defaultProps={{ showSafeArea: false }}
        durationInFrames={moonCues.durationInFrames}
        {...VIDEO}
      />
      <Composition
        id="003-mirror-left-right"
        component={mirrorLeftRight.Component}
        schema={episodeSchema}
        calculateMetadata={mirrorLeftRight.calculateMetadata}
        defaultProps={{ showSafeArea: false }}
        durationInFrames={mirrorCues.durationInFrames}
        {...VIDEO}
      />
      <Folder name="tools">
        <Still
          id="MeasureTex"
          component={MeasureTex}
          schema={measureTexSchema}
          defaultProps={{ items: [{ tex: "\\frac{x}{2}", fontSize: 58 }] }}
          {...VIDEO}
        />
      </Folder>
      <Folder name="brand">
        <Still id="Logo" component={LogoStill} width={LOGO_UNIT} height={LOGO_UNIT} />
        <Still id="Avatar" component={Avatar} {...AVATAR} />
        <Still id="Watermark" component={Watermark} {...WATERMARK} />
        <Still
          id="Banner"
          component={Banner}
          schema={bannerSchema}
          defaultProps={{ showSafeArea: false, lang: "ko" }}
          {...BANNER}
        />
        <Still
          id="BannerEn"
          component={Banner}
          schema={bannerSchema}
          defaultProps={{ showSafeArea: false, lang: "en" }}
          {...BANNER}
        />
      </Folder>
    </>
  );
};
