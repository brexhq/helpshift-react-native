package com.helpshift.reactlibrary;

import android.app.Activity;
import android.app.Application;
import android.net.Uri;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.LinearLayout;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.view.ReactViewGroup;
import com.helpshift.Core;
import com.helpshift.CoreInternal;
import com.helpshift.HelpshiftUser;
import com.helpshift.InstallConfig;
import com.helpshift.delegate.AuthenticationFailureReason;
import com.helpshift.exceptions.InstallException;
import com.helpshift.support.ApiConfig;
import com.helpshift.support.Support;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class RNHelpshiftView extends ViewGroupManager<ReactViewGroup> implements Support.Delegate {

    public static final String REACT_CLASS = "RNTHelpshift";

    private ThemedReactContext mReactContext;
    private Application mApplication;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public ReactViewGroup createViewInstance(ThemedReactContext context)  {
        final ReactViewGroup reactView = new ReactViewGroup(context);
        mReactContext = context;
        mApplication = (Application)context.getApplicationContext();
        return reactView;
    }

    @ReactProp(name = "config")
    public void setConfig(final ReactViewGroup reactView, ReadableMap config) {
        Map<String, Object> extras = new HashMap<>();
        extras.put("manualLifecycleTracking", true);
        extras.put("enableDefaultConversationalFiling", true);
        InstallConfig installConfig = new InstallConfig.Builder().setExtras(extras).build();


        Core.init(Support.getInstance());

        try {
            Core.install(mApplication,  config.getString("apiKey"),  config.getString("domain"),  config.getString("appId"), installConfig);
            CoreInternal.onAppForeground();
        } catch (InstallException e) {
            Log.e("Helpshift", "invalid install credentials : ", e);
        }

        if (config.hasKey("user")) {
            this.login(config.getMap("user"));
        }
        Support.setDelegate(this);

        Activity activity = mReactContext.getCurrentActivity();
        final FragmentManager fragmentManager = ((AppCompatActivity)activity).getSupportFragmentManager();
        final Fragment helpshiftFragment;
;

        if (config.hasKey("cifs")) {
            ApiConfig apiConfig = new ApiConfig.Builder().setCustomIssueFields(getCustomIssueFields(config.getMap("cifs"))).build();
            Support.showConversation(mReactContext.getCurrentActivity(), apiConfig);

        } else {
            Support.showConversation(mReactContext.getCurrentActivity());

        }

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, 0);


        reactView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                fragmentManager.executePendingTransactions();
                for (int i = 0; i < reactView.getChildCount(); i++) {
                    View child = reactView.getChildAt(i);
                    child.measure(View.MeasureSpec.makeMeasureSpec(reactView.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                            View.MeasureSpec.makeMeasureSpec(reactView.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
                    child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
                }
            }
        });

    }

    private void login(ReadableMap user){
        HelpshiftUser userBuilder;
        String email = user.hasKey("email") ? user.getString("email") : null;
        String identifier = user.hasKey("identifier") ? user.getString("identifier") : null;
        if(user.hasKey("name") && user.hasKey("authToken")) {
            userBuilder = new HelpshiftUser.Builder(identifier, email)
                    .setName(user.getString("name"))
                    .setAuthToken(user.getString("authToken"))
                    .build();
        } else if (user.hasKey("name")) {
            userBuilder = new HelpshiftUser.Builder(identifier, email)
                    .setName(user.getString("name"))
                    .build();
        } else if (user.hasKey("authToken")) {
            userBuilder = new HelpshiftUser.Builder(identifier, email)
                    .setAuthToken(user.getString("authToken"))
                    .build();
        } else {
            userBuilder = new HelpshiftUser.Builder(identifier, email).build();
        }

        Core.login(userBuilder);
    }

    private Map<String, String[]> getCustomIssueFields(ReadableMap cifs) {
        ReadableMapKeySetIterator iterator = cifs.keySetIterator();
        Map<String, String[]> customIssueFields = new HashMap<>();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableArray array = cifs.getArray(key);
            customIssueFields.put(key, new String[]{array.getString(0), array.getString(1)});
        }

        return customIssueFields;
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void sessionBegan() {
        Log.d("Helpshift", "sessionBegan");
        sendEvent(mReactContext, "Helpshift/SessionBegan", Arguments.createMap());
    }

    @Override
    public void sessionEnded() {
        Log.d("Helpshift", "sessionEnded");
        sendEvent(mReactContext, "Helpshift/SessionEnded", Arguments.createMap());
    }

    @Override
    public void newConversationStarted(String newConversationMessage) {
        Log.d("Helpshift", "newConversationStarted");
        WritableMap params = Arguments.createMap();
        params.putString("newConversationMessage", newConversationMessage);
        sendEvent(mReactContext, "Helpshift/NewConversationStarted", params);
    }

    @Override
    public void conversationEnded() {
        Log.d("Helpshift", "conversationEnded");
        sendEvent(mReactContext, "Helpshift/ConversationEnded", Arguments.createMap());
    }

    @Override
    public void userRepliedToConversation(String newMessage) {
        Log.d("Helpshift", "userRepliedToConversation");
        WritableMap params = Arguments.createMap();
        params.putString("newMessage", newMessage);
        sendEvent(mReactContext, "Helpshift/UserRepliedToConversation", params);
    }

    @Override
    public void userCompletedCustomerSatisfactionSurvey(int rating, String feedback) {
        Log.d("Helpshift", "userCompletedCustomerSatisfactionSurvey");
        WritableMap params = Arguments.createMap();
        params.putInt("rating", rating);
        params.putString("feedback", feedback);
        sendEvent(mReactContext, "Helpshift/UserCompletedCustomerSatisfactionSurvey", params);
    }


    //TODO: determine if File can be sent by React Native bridge
    @Override
    public void displayAttachmentFile(Uri attachmentFile) { }

    // TODO: determine if File can be sent by React Native bridge
    @Override
    public void displayAttachmentFile(File attachmentFile) {}

    @Override
    public void didReceiveNotification(int newMessagesCount) {
        Log.d("Helpshift", "didReceiveNotification");
        WritableMap params = Arguments.createMap();
        params.putInt("newMessagesCount", newMessagesCount);
        sendEvent(mReactContext, "Helpshift/DidReceiveNotification", params);
    }

    @Override
    public void authenticationFailed(HelpshiftUser user, AuthenticationFailureReason reason) {
        Log.d("Helpshift", "authenticationFailed");
        WritableMap params = Arguments.createMap();
        params.putString("user", user.toString());
        params.putString("reason", reason.toString());
        sendEvent(mReactContext, "Helpshift/AuthenticationFailed", params);
    }

}