import React from "react";
import { NativeEventEmitter, NativeModules, requireNativeComponent, View } from "react-native";
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
const MODULE_UNAVAILABLE_WARNING = "Native module unavailable in project binary.";
class Helpshift extends React.PureComponent {
    render() {
        return <RNTHelpshift {...this.props}/>;
    }
}
Helpshift.init = (apiKey, domain, appId) => RNHelpshift
    ? RNHelpshift.init(apiKey, domain, appId)
    : console.warn(MODULE_UNAVAILABLE_WARNING);
// TODO: Rerender Helpshift view on iOS if using <Helpshift/>
Helpshift.login = (user) => RNHelpshift
    ? RNHelpshift.login(user)
    : console.warn(MODULE_UNAVAILABLE_WARNING);
Helpshift.logout = () => RNHelpshift
    ? RNHelpshift.logout()
    : console.warn(MODULE_UNAVAILABLE_WARNING);
Helpshift.requestUnreadMessagesCount = () => RNHelpshift
    ? RNHelpshift.requestUnreadMessagesCount()
    : console.warn(MODULE_UNAVAILABLE_WARNING);
Helpshift.showConversationWithCIFs = (cifs) => RNHelpshift
    ? RNHelpshift.showConversationWithCIFs(cifs)
    : console.warn(MODULE_UNAVAILABLE_WARNING);
Helpshift.showConversation = () => RNHelpshift
    ? RNHelpshift.showConversation()
    : console.warn(MODULE_UNAVAILABLE_WARNING);
Helpshift.isAvailable = isHelpshiftAvailable;
Helpshift.eventEmitter = RNHelpshift
    ? new NativeEventEmitter(RNHelpshift)
    : mockEmitter;
export default Helpshift;
