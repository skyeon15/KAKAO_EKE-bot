const scriptName = "KAKAO";
const { KakaoLinkClient } = require('kakaolink');
const Kakao = new KakaoLinkClient("882899bfe96abba1203fcd393dbca595", "https://bbforest.net")
Kakao.login('hkbot@kakao.com', 'zkzkdh1484');
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
 /*
		objData={};
		objData["grade"]=grade;
		objData["gold"]=gold;
		objData["silver"]=silver;
		objData["bronze"]=bronze;
		Kalink.send(room,57746,objData);
 */
 function sendLink(room, templateId, argsObj) {

  try {

    Kakao.sendLink(room, {

      "link_ver": "4.0", 

      "template_id": templateId, 

      "template_args": argsObj

    },

    "custom");

    return true;

  } catch(e) {

    Api.replyRoom("에케",

      "【KAKAOLINK ERROR】\n"+

      "Room: "+room+"\n"+

      "Template ID: "+templateId+"\n"+

      "argsObj: \n"+JSON.stringify(argsObj, null, 2)+"\n"+

      "Error :"+e.message

    );

    return false;

  }

}
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
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