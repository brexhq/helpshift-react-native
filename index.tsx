import React from "react";
import {
  NativeEventEmitter,
  NativeModules,
  requireNativeComponent,
  View,
  ViewStyle
} from "react-native";

interface HelpshiftUser {
  authToken: string;
  identifier: string;
  name: string;
  email: string;
}

interface HelpshiftConfig {
  user: HelpshiftUser;
  cifs: object;
  apiKey: string;
  domain: string;
  appId: string;
  width: number;
  height: number;
}

interface HelpshiftProps {
  config: HelpshiftConfig;
  style?: ViewStyle;
}

function isHelpshiftAvailable() {
  return "RNTHelpshift" in NativeModules.UIManager;
}

function getHelp() {
  if (isHelpshiftAvailable()) {
    return requireNativeComponent("RNTHelpshift");
  }
  return View;
}

const RNTHelpshift = getHelp();
const { RNHelpshift } = NativeModules;

const mockEmitter = {
  once: () => console.warn(MODULE_UNAVAILABLE_WARNING),
  addListener: () => console.warn(MODULE_UNAVAILABLE_WARNING),
  removeListener: () => console.warn(MODULE_UNAVAILABLE_WARNING),
  removeAllListeners: () => console.warn(MODULE_UNAVAILABLE_WARNING)
};

const MODULE_UNAVAILABLE_WARNING =
  "Native module unavailable in project binary.";

class Helpshift extends React.PureComponent<HelpshiftProps> {
  render() {
    return <RNTHelpshift {...this.props} />;
  }

  static init = (apiKey: string, domain: string, appId: string) =>
    RNHelpshift
      ? RNHelpshift.init(apiKey, domain, appId)
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  // TODO: Rerender Helpshift view on iOS if using <Helpshift/>
  static login = (user: HelpshiftUser) =>
    RNHelpshift
      ? RNHelpshift.login(user)
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static logout = () =>
    RNHelpshift
      ? RNHelpshift.logout()
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static requestUnreadMessagesCount = () =>
    RNHelpshift
      ? RNHelpshift.requestUnreadMessagesCount()
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static showConversationWithCIFs = (cifs: object) =>
    RNHelpshift
      ? RNHelpshift.showConversationWithCIFs(cifs)
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static showConversation = () =>
    RNHelpshift
      ? RNHelpshift.showConversation()
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static isAvailable = isHelpshiftAvailable;

  static eventEmitter = RNHelpshift
    ? new NativeEventEmitter(RNHelpshift)
    : mockEmitter;
}

export default Helpshift;
