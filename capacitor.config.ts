import type {CapacitorConfig} from "@capacitor/cli";

const config:CapacitorConfig={
  appId:"com.hiddenlaws.ascendfocus",
  appName:"ASCEND Focus",
  webDir:"dist",
  bundledWebRuntime:false,
  backgroundColor:"#0b1420",
  android:{allowMixedContent:false},
  ios:{contentInset:"automatic"}
};

export default config;
