const scriptName = "compile";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if((sender == "에케") && (msg == "/컴파일")) {
        try {
            Api.off(js);
            Api.compile(js);
            Api.on(js);
            replier.reply(js + " 컴파일 완료");
        } catch(error) {
            replier.reply(error);
        }
    }

    if((sender == "에케") && (msg == "/목록")) {
        replier.reply(Api.getScriptNames().join("/"));
    }

    if((sender == "에케") && (msg.indexOf("/선택") !== -1)) {
        js = msg.split(" ")[1];
        replier.reply("선택 : " + js);
    }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}