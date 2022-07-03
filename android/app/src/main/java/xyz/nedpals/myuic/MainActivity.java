package xyz.nedpals.myuic;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        this.bridge.getWebView().getSettings().setTextZoom(70);
    }
}
