// Applies to the CLI only; the Node.js render APIs take options directly.
// All configuration options: https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
