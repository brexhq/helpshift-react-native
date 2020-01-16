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

function getHelp() {
  try {
    const loaded = requireNativeComponent("RNTHelpshift");
    return loaded;
  } catch {
    return View;
  }
}

const RNTHelpshift = getHelp();
const { RNHelpshift } = NativeModules;

const mockEmitter = {
  once: () => null,
  addListener: () => null,
  removeListener: () => null,
  removeAllListeners: () => null
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

  static showFAQs = () =>
    RNHelpshift
      ? RNHelpshift.showFAQs()
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static requestUnreadMessagesCount = () =>
    RNHelpshift
      ? RNHelpshift.requestUnreadMessagesCount()
      : console.warn(MODULE_UNAVAILABLE_WARNING);

  static eventEmitter = RNHelpshift
    ? new NativeEventEmitter(RNHelpshift)
    : mockEmitter;
}

export default Helpshift;
