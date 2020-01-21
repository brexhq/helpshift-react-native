import React from "react";
import { ViewStyle } from "react-native";
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
declare function isHelpshiftAvailable(): boolean;
declare class Helpshift extends React.PureComponent<HelpshiftProps> {
    render(): JSX.Element;
    static init: (apiKey: string, domain: string, appId: string) => any;
    static login: (user: HelpshiftUser) => any;
    static logout: () => any;
    static requestUnreadMessagesCount: () => any;
    static isAvailable: typeof isHelpshiftAvailable;
    static eventEmitter: import("react-native").EventEmitter | {
        once: () => void;
        addListener: () => void;
        removeListener: () => void;
        removeAllListeners: () => void;
    };
}
export default Helpshift;
