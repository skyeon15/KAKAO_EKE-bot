const scriptName = "에케봇";
const Kalink=Bridge.getScopeOf("KAKAO");
/**
* (string) room
* (string) sender
* (boolean) isGroupChat
* (void) replier.reply(message)
* (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
* (string) imageDB.getProfileBase64()
* (string) packageName
*/
var Game = {};
var Hanb = org.jsoup.Jsoup.connect("https://wordrow.kr/시작하는-말/").get().text().split(" ").join("").split("한방기본단어:780개•")[1].split("⇈wordrow.kr")[0].replace("끝말잇기한방북한어:146개","").split("•");
function isWord(word){
  try{
    var a = org.jsoup.Jsoup.connect("https://wordrow.kr/시작하는-말/"+word).get().text().split(" ").join("").split("모든글자:")[1];
    var numl = a.split("개")[1].split(":")[0];
    if (numl==word) return true;
    else return false;
  }catch(e){return false;}
}
function wordmean(word){
  try{
    var a = org.jsoup.Jsoup.connect("https://wordrow.kr/의미/"+word+"/?").get().text();
    var b = a.substr(4+word.length).split(".")[0].split(",")[0];
    if (b.includes("WORDROW")) b = b.split("WORDROW")[0];
    return b;
  }catch(e){return word;}
}
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
	
  const say = (txt) => Api.replyRoom(room,txt);
  msg=="끝말초기화"&&sender=="WhiteTornado.ㅅㅇ"&&Api.reload("끝말")&&say("ON");
  if (Game[room]&&!Game[room].player[Game[room].turn]) Game[room].turn=0;
  if (Game[room]&&Game[room].cmd==1) msg = "";
  if (msg=="끝말참가"){
    if (!Game[room]){
      Game[room]={"turn":0,"ison":0,"player":[sender],"usedword":[],"hanbang":[],cmd:0};
      say("[ "+sender+" ] 님이 끝말잇기 방을 생성했어요.\n참가를 원하시면 \"끝말참가\"를 입력해주세요.");
    }else if (Game[room].ison==0){
      if (!Game[room].player.includes(sender)){
        Game[room].cmd=1;
        Game[room].player.push(sender);
        say("[ "+sender+" ] 님이 끝말잇기에 참가했어요.\n"+"\u200b".repeat(500)+"\n\n\n<현재 진행 방>\n[ "+room+" ]\n\n<현재 참가자 ("+Game[room].player.length+"명)>\n[ "+Game[room].player[0]+" ](방장)\n[ "+Game[room].player.slice(1,Game[room].player.length).join(" ]\n[ ")+" ]");
        Game[room].cmd=0;
      }else say("[ "+sender+" ] 님은 이미 참가했어요.");
    }else say("[!] 이미 게임이 시작되었어요.");
  }else if (msg=="끝말시작"){
    if (Game[room]){
      if (Game[room].ison==0){
        if (sender==Game[room].player[0]){
          if (Game[room].player.length>1){
            Game[room].cmd=1;
            Game[room].ison=1;
            say("<놀이시작!>\n[ 차례 ] : [ "+Game[room].player[0]+" ]\n[ 입력방법 ] : [ 0단어 ]");
            Game[room].cmd=0;
          }else say("[!] 참가자가 부족해 게임을 진행할 수 없어요.");
        }else say("[!] 방장 [ "+Game[room].player[0]+" ] 님만 게임을 시작할 수 있어요.");
      }else say("[!] 이미 게임이 시작되었어요.");
    }else say("[!] 생성된 방이 없어요. \"끝말참가\"로 방을 생성해주세요.");
  }else if (msg=="끝말퇴장"||msg=="끝말포기"){
    if (Game[room]){
      if (Game[room].player.includes(sender)){
        Game[room].cmd=1;
        var where = Game[room].player.indexOf(sender);
        Game[room].player.splice(where, 1);
        if (Game[room].player.length==0){
          say("[!] 참가자가 모두 퇴장했으므로 게임을 종료해요.");
          delete Game[room];
        }else if (Game[room].player.length==1){
          if (Game[room].ison>0) say("[!] 참가자가 1명이므로 게임을 종료해요.\n최종 승리 : [ "+Game[room].player[0]+" ]"), delete Game[room];
          else say("<끝말잇기>\n게임 상태 : [ 참가자 입장중 ]\n퇴장 : [ "+sender+" ]\n남은 참가자("+Game[room].player.length+") : ["+Game[room].player.join("], [")+"]");
        }else if (Game[room].ison>0) say("<DATA>\n게임 상태 : [ 진행중 ]\n퇴장 : [ "+sender+" ]\n남은 참가자("+Game[room].player.length+") : ["+Game[room].player.join("], [")+"]");
        else say("<끝말잇기>\n게임 상태 : [ 참가자 입장중 ]\n퇴장 : [ "+sender+" ]\n남은 참가자("+Game[room].player.length+") : ["+Game[room].player.join("], [")+"]");
        if (Game[room]) Game[room].turn--;
        if (Game[room]&&Game[room].turn>=Game[room].player.length||Game[room]&&Game[room].turn<0) Game[room].turn=0;
        if (Game[room]) Game[room].cmd=0;
      }else say("[!] 참가자가 아니에요.");
    }else say("[!] 생성된 방이 없어요.");
  }else if (msg.slice(0,1)=="0"&&msg.length>1){
    if (msg.includes(" ")) msg = msg.split(" ").join("");
    if (Game[room]){
      if (!Game[room].ison==0){
        if (msg.length>2){
          Game[room].cmd=1;
          PlayGame();
          if (Game[room]) Game[room].cmd=0;
        }else say("[!] 두 글자 이상의 단어를 입력해주세요.");
      }else say("[!] 아직 게임이 시작되지 않았어요.");
    }else say("[!] 생성된 방이 없어요. \"끝말참가\"로 방을 생성해주세요.");
  }
  function PlayGame(){
    if (Game[room].ison==1){
      if (!isHanbang(msg.slice(1))){
        if (isWord(msg.slice(1))){
          Game[room].usedword.push(msg.slice(1));
          Game[room].ison=2;
          Game[room].turn++;
          say("<끝말잇기>\n입력한 단어 : [ "+msg.slice(1)+" ]\n뜻 : [ "+wordmean(msg.slice(1))+" ]\n차례 : [ "+Game[room].player[Game[room].turn]+" ]\n시작단어 : [ "+msg.slice(-1)+" ]");
        }else say("[!] [ "+msg.slice(1)+" ] 라는 단어는 존재하지 않아요.");
      }else say("[!] 첫 단어는 한방단어를 입력할 수 없어요.");
    }else if (Game[room].ison==2){
      if (sender==Game[room].player[Game[room].turn]){
        if (msg.slice(1,2)==Game[room].usedword.slice(-1)[0].slice(-1)){
          if (!isHanbang(msg.slice(1))){
            if (isWord(msg.slice(1))){
              if (!Game[room].usedword.includes(msg.slice(1))){
                Game[room].usedword.push(msg.slice(1));
                Game[room].turn++;
                if (Game[room].turn>=Game[room].player.length) Game[room].turn=0;
                say("<끝말잇기>\n입력한 단어 : [ "+msg.slice(1)+" ]\n뜻 : [ "+wordmean(msg.slice(1))+" ]\n차례 : [ "+Game[room].player[Game[room].turn]+" ]\n시작단어 : [ "+msg.slice(-1)+" ]"+"\u200b".repeat(500)+"\n\n\n\n<단어 사용기록>\n["+Game[room].usedword.join("] > [")+"]");
              }else say("[!] 이미 게임에서 사용된 단어에요.");
            }else say("[!] [ "+msg.slice(1)+" ] 라는 단어는 존재하지 않아요.");
          }else say("[!] 한방단어 입력으로 인해 게임이 종료되었어요."), EndGame();
        }else say("[ "+Game[room].usedword.slice(-1)[0].slice(-1)+" ] (으)로 시작하는 단어를 입력해주세요.");
      }else say("[!] 지금은 [ "+Game[room].player[Game[room].turn]+" ] 님의 차례에요.");
    }else say("[!] 소스에 오류가 있어요. 게임이 강제로 종료되었어요."), delete Game[room];
  }
  function EndGame(){
    Game[room].cmd=1;
    say("<FINAL RESULT>\n최종 승리 : [ "+Game[room].player[Game[room].turn]+" ]\n마지막 단어 : [ "+msg.slice(1)+" ]"+"\u200b".repeat(500)+"\n\n\n\n<단어 사용기록>\n[ "+Game[room].usedword.join(" ]\n[ ")+" ]\n[ "+msg.slice(1)+" ](최종 입력단어)");
    delete Game[room];
  }
  function isHanbang(word){
    return !!Hanb.includes(word);
  }
////////끝말잇기 종료

	if(msg.includes("도움말")){
		replier.reply(room, "키워드는 끝말, 날씨, 코로나, 로아, 로또, 티비, 올림픽, 만화, 가위바위보, 홀짝, 주사위, 돈, 사랑, 인사, 공부, 힘들어, 히오스, 뭐야입니다!");
	}
	else if(msg == "끝말"){
		replier.reply(room, "끝말잇기\n[낱말의 끝음절을 첫음절로 하는 단어로 이어가는 놀이]\n\n끝말참가 : 놀이에 참가합니다.\n끝말시작 : 놀이를 시작합니다.\n끝말포기 : 놀이를 포기합니다.\n0<단어> : 단어를 입력합니다.");
	}
	else if(msg.includes("편성")||msg.includes("티비")||msg.includes("tv")){
		data = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=%ED%8E%B8%EC%84%B1%ED%91%9C").get().select("li.program_item.on"), c = [], objData={};
		for (i = 0; i < 6; i++) {
		c[i] = data.get(i).select(".pr_name").text();
		objData["c" + i] = c[i];
		}
		if(!Kalink.sendLink(room,58660,objData)) replier.reply(room,"현재 방송중인 프로그램입니다.\nKBS1 " + c[0] + "\nKBS2 " + c[1] + "\nMBC " + c[2] + "\nSBS " + c[3] + "\nEBS1 " + c[4]);;
	}
	else if(msg.includes("올림픽")){
		//파싱
		var data = org.jsoup.Jsoup.connect("https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&mra=blM4&pkid=6011&qvt=0&query=%EB%8F%84%EC%BF%84%20%EC%98%AC%EB%A6%BC%ED%94%BD").get();
		//올림픽 우리나라 순위
		var grade = data.select("div[class=sub_title] > span[class=txt]").text();
		//우리나라 금메달 갯수
		var gold = data.select("div[class=medal_info] > span[class=ico_medal gold]").text().replace(/[^0-9]/g,'');
		//우리나라 은메달 갯수
		var silver = data.select("div[class=medal_info] > span[class=ico_medal silver]").text().replace(/[^0-9]/g,'');
		//우리나라 동메달 갯수
		var bronze = data.select("div[class=medal_info] > span[class=ico_medal bronze]").text().replace(/[^0-9]/g,'');
		//replier.reply("제32회 도쿄 올림픽\n종합순위 : " + grade + "\n금메달 : " + gold + "개\n은메달 : " + silver + "개\n동메달 : " + bronze + "개");
		
		objData={};
		objData["grade"]=grade;
		objData["gold"]=gold;
		objData["silver"]=silver;
		objData["bronze"]=bronze;
		if(!Kalink.sendLink(room,57746,objData)) replier.reply(room, "제32회 도쿄 올림픽 현황\n" + grade + "\n금메달 " + gold + "개\n은메달 " + silver + "개\n동메달 " + bronze);;
	}
	else if(msg.includes("코로나")){
		var data = org.jsoup.Jsoup.connect("http://ncov.mohw.go.kr").get().select("ul.liveNum").select("span");////ul=class의 liveNum에서 <span>선택
		var rel = data.get(3).text();//<span> 다섯번째줄 가져옴
		var rel2 = data.get(4).text().replace(/(\s*)/g,"");//<span> 다섯번째줄 가져옴
		var hos = data.get(6).text();//<span> 여덟번째줄 가져옴
		var hos2 = data.get(7).text().replace(/(\s*)/g,"");//<span> 여덟번째줄 가져옴
		var die = data.get(8).text();//<span> 열번째줄 가져옴
		var die2 = data.get(9).text().replace(/(\s*)/g,"");//<span> 열번째줄 가져옴
		
		res = JSON.parse(org.jsoup.Jsoup.connect("https://apiv2.corona-live.com/stats.json").ignoreContentType(true).get().text()).overview;
		confirmed = res.confirmed.toString().split(',');
		confirmed1 = confirmed[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		confirmed2 = confirmed[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		current = res.current.toString().split(',');
		current1 = current[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		//API 로딩 및 배열 선언
		var vac = org.jsoup.Jsoup.connect("https://nip.kdca.go.kr/irgd/cov19stats.do").parser(org.jsoup.parser.Parser.xmlParser()).get().select("item"), firstCnt = [], secondCnt = [];
		//배열에 API 데이터 대입
		for (var i = 0; i < vac.size(); i++) {
			firstCnt[i] = vac.select("firstCnt").get(i).text().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		for (var i = 0; i < vac.size(); i++) {
			secondCnt[i] = vac.select("secondCnt").get(i).text().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		
		
		//출력
		replier.reply("[실시간 - 국내 코로나 현황]" + "\n전일 0시 기준 : " + confirmed1 + "\n전일대비 : " + confirmed2 + "\n오늘 확진자 : " + current1 + "\n완치 수: " + rel + rel2 + "\n격리자 수: "+ hos + hos2 + "\n사망자 수: "+ die + die2 + "\n\n1차 접종 수 : " + firstCnt[2] + "\n                 (+" + firstCnt[0] + ")\n2차 접종 수 : " + secondCnt[2] + "\n                 (+" + secondCnt[0] + ")");
	}
	else if(msg.includes("웹툰")||msg.includes("만화")){
		to = "http://comic.naver.com/webtoon/weekdayList.nhn?week=" + ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()], img = [], title = [], rtext = [], url = [], murl = [];
        data = org.jsoup.Jsoup.connect(to).get();
		week = data.select("h3.sub_tit").text().split(" ");
		week = week[0];
        writer = data.select("dd.desc > a[href=#]");
		obj = data.select("div.thumb > a[href^=/webtoon/list]");
		imgd = obj.select("img"),
		objData={};
		objData["week"] = week;
		for (i = 0; i < 6; i++) {
			title[i] = obj.eq(i).attr("title");//타이틀
			rtext[i] = writer.eq(i).text();//작가
			url[i] = "redirect?url=https://comic.naver.com" + obj.eq(i).attr("href").replace(/&/g, '%26');//url
			murl[i] = "redirect?url=https://m.comic.naver.com" + obj.eq(i).attr("href").replace(/&/g, '%26');//url
			img[i] = imgd.eq(i).attr("src");//사진
			objData["title" + i] = title[i];
			objData["rtext" + i] = rtext[i];
			objData["url" + i] = url[i];
			objData["murl" + i] = murl[i];
			objData["img" + i] = img[i];
		}
		objData["url"] = "redirect?url=https://comic.naver.com/webtoon/weekday";
		objData["murl"] = "redirect?url=https://m.comic.naver.com/webtoon/weekday";
		objData["title"] = week + "일 웹툰 순위";
		objData["btext"] = week + "웹툰 전체보기";
		if(!Kalink.sendLink(room,58470,objData)) replier.reply(room, week + "웹툰 순위\n1. " + title[0] + "\n2. " + title[1] + "\n3. " + title[2] + "\n4. " + title[3] + "\n5. " + title[4]);;
	}
	else if(msg.includes("로또")||msg.includes("복권")){
		str = "";
		web = org.jsoup.Jsoup.connect("https://dhlottery.co.kr/gameResult.do?method=byWin").get();
		lottoround = web.select("div.win_result").select("h4").text();
		lottodate = web.select("div.win_result").select("p.desc").text().replace("(", "").replace(")", "");
		lottonum = web.select("div.win_result").select("span");
		lottomoney = web.select("td");

		str = str + "★ 로또6/45  " + lottoround + " ★\n       " + lottodate + "\n";
		str = str + "\n당첨번호 : " + lottonum.get(0).text() + ", " + lottonum.get(1).text() + ", " + lottonum.get(2).text() + ", " + lottonum.get(3).text() + ", " + lottonum.get(4).text() + ", " + lottonum.get(5).text();
		str = str + "\n보너스 번호 : "  + lottonum.get(6).text();


		str = str + "\n\n1등 당첨게임 수 : " + lottomoney.get(2).text() + "\n1등 당첨금 : " + lottomoney.get(3).text();
		str = str + "\n\n2등 당첨게임 수 : " + lottomoney.get(8).text() + "\n2등 당첨금 : " + lottomoney.get(9).text();
		str = str + "\n\n3등 당첨게임 수 : " + lottomoney.get(13).text() + "\n3등 당첨금 : " + lottomoney.get(14).text();
		replier.reply(str);
	}
	else if(msg.includes("돈")){
		var random = new Array('돈문제는 엮이는거 아니래요ㅡㅅㅡ', '돈은 빌려주는거 아니래요ㅡㅅㅡ');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("사랑")||msg.includes("애정")){
		var random = new Array('저도 많이 사랑해요♥♥', '애정합니당♥');
		replier.reply(room, sender+"님 "+randomItem(random));
	}
	else if(msg.includes("안녕")||msg.includes("방가")||msg.includes("하이")||msg.includes("헬로")||msg.includes("hi")||msg.includes("hello")){
		var random = new Array('방가워요!!', '안녕안녕!', '반가워!');
		replier.reply(room, sender+"님 "+randomItem(random));
	}
	else if(msg.includes("잘자")||msg.includes("졸려")){
		var random = new Array('잘자고 좋은 꿈 꿔요 :)', '아직 안 잤어요? 언능 자요!');
		replier.reply(room, sender+"님 "+randomItem(random));
	}
	else if(msg.includes("학점")||msg.includes("공부")){
		var random = new Array('조금만 힘내면 좋은 결과 있을거에요!!', '힘내서 공부해요!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("뭐야")){
		var random = new Array('뭐야뭐야! 무슨일이야!', '뭐가 뭐에요!!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("시공")||msg.includes("히오스")||msg.includes("폭풍")){
		var random = new Array('시공의 폭풍속으로!', '시공시러ㅡㅡ');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("자살")||msg.includes("힘들")||msg.includes("죽을")||msg.includes("죽고")){
		var random = new Array('조금만 힘내봐요. 제가 곁에 있을게요.', '상담이 필요하면 @에케 로 친구추가 후 카톡주세요!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("가위")||msg.includes("바위")||msg.includes("보자기")){
		var random = new Array('가위!', '바위!', '보자기!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("동전")){
		var random = new Array('앞면이 나왔어요!', '뒷면이 나왔어요!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("놀자")||msg.includes("놀아")||msg.includes("놀고")){
		var random = new Array('뭐하고 놀까요?', '홀짝 할래요?', '가위바위보 해요!', '주사위 던져봐요!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("홀짝")){
		var random = new Array('홀!!', '짝!!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("주사위")){
		var random = new Array('1! 한 칸!', '2! 두 칸!', '3! 세 칸!', '4! 네 칸!', '5! 다섯 칸!', '6! 여섯 칸!');
		replier.reply(room, randomItem(random));
	}
	else if(msg.includes("!위키백과")){
		response = (a, b) => {if(b.startsWith('!위키백과 ')){try{d=org.jsoup.Jsoup.connect('https://ko.m.wikipedia.org/wiki/'+encodeURI(b.substr(6))).get();Api.replyRoom(a,'위키백과 '+b.substr(6)+" 검색결과 : "+ "​".repeat(1000) + "\n\n"+d.select('p').toArray ().map((e)=>e.text()).join('\n\n')+d.select('ol.references').select('li').toArray ().map((e,i)=>"["+(i+1)+"]"+e.text()).join('\n\n'));}catch(e){Api.replyRoom(a,"검색결과가 없습니다");}}};
	}
	var cmd = msg.split(" ");
	if (cmd[0] == "로아" && cmd[1] != "") {
		var data0 = org.jsoup.Jsoup.connect("https://lostark.game.onstove.com/Profile/Character/" + cmd[1]).get();
		var data = data0.select("div.profile-ingame");
		var lv = data.select("div.level-info").select("span");
		var lv_ex = lv.get(1).ownText();
		var lv_ba = lv.get(2).ownText();
		var lv_it = data.select("div.level-info2").select("span").get(1).ownText();
		var info = data.select("div.game-info").select("span");
		var title = info.get(1).text();
		var guild = info.get(2).text();
		var pvp = info.get(4).text();
		var job = data0.select("img.profile-character-info__img").attr("alt");
		var server = data0.select("span.profile-character-info__server").text().replace("@", "");
		var result = "이름 : " + cmd[1] +
		"\n직업 : " + job +
		"\n서버 : " + server +
		"\n전투 레벨 : " + lv_ba +
		"\n원정대 레벨 : " + lv_ex +
		"\n무기 레벨 : " + lv_it +
		"\n칭호 : " + title +
		"\nPVP : " + pvp;
		if (guild != "-") result += "\n길드 : " + guild;
		replier.reply("[로스트아크 캐릭터 정보]\n\n" + result);
	}
	if (msg.includes("한강")){
		temp = JSON.parse(org.jsoup.Jsoup.connect("http://hangang.dkserver.wo.tc").ignoreContentType(true).get().text());
		var data = org.jsoup.Jsoup.connect("https://hangang.life").get().select("div.uk-container").select("span").get(1).ownText().replace('" ', "").replace(' "', "");
		replier.reply ("현재 한강 온도 : "+temp.temp+'\n"'+data+'"');
	}
	if(msg.indexOf("날씨") == 0){
		cmd = msg.substr(3);
		cmd.trim();
		try{
			var weatherStr ="";

			var weatherarea = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=" + cmd + "날씨").get().select("div.title_wrap").select("h2").text();

			if ( !weatherarea ) {
				replier.reply(cmd + " 의 날씨 정보를 가져올 수 없습니다.");
				return;
			}
			var weatherdata = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=" + cmd + "날씨").get().select("div.status_wrap");

			var weathertom = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=" + cmd + "날씨").get().select("div.inner_box");

			var wtmain = weatherdata.select("div.weather_main").get(0).text(); // 현재 날씨
			var nowtem = weatherdata.select("div.temperature_text").get(0).text().replace("현재 온도", "").replace("°", "") + " ℃"; // 현재 온도
			var uptem = weatherdata.select("dd.up_temperature").text().replace("°", "") + " ℃"; // 최고 온도
			var dntem = weatherdata.select("dd.down_temperature").text().replace("°", "") + " ℃"; // 최저 온도
			var fltem = weatherdata.select("dd.feeling_temperature").text().replace("체감", "").replace("°", "") + " ℃"; // 체감 온도

			var reportlist = weatherdata.select("ul.list_box");

			var rpsp = reportlist.select("li.type_report report8").select("span.figure_text").text();
			var rptext = reportlist.select("span.figure_text").text().split(" ");
			var rpresult = reportlist.select("span.figure_result").text().split(" ");

			var titlelist = [["미세먼지", "초미세먼지", "자외선", "습도", "바람"],["㎍/㎥", "㎍/㎥", "", "%", "m/s"]];

			weatherStr = weatherStr + "[ " + cmd + " ] 의 날씨 정보입니다.\n 위치 : " + weatherarea;
			weatherStr = weatherStr + "\n\n현재 날씨 : " + wtmain + "\n현재 온도 : " + nowtem + "\n최고 온도 : " + uptem + "\n최저 온도 : " + dntem + "\n체감 온도 : " + fltem + "\n";

			if (rptext.length > rpresult.length){
				weatherStr = weatherStr + "\n기상 특보 : " + rptext[0];
				for ( var i = 0; i < rpresult.length ; i ++) {
					weatherStr = weatherStr + "\n" + titlelist[0][i] + " : " + rptext[i+1] + "   " + rpresult[i] + " " + titlelist[1][i];
				}
			} else {
				for ( var i = 0; i < rptext.length ; i ++) {
					weatherStr = weatherStr + "\n" + titlelist[0][i] + " : " + rptext[i] + "   " + rpresult[i] + " " + titlelist[1][i];
				}
			}

			weatherStr = weatherStr + "\n\n내일 오전 날씨 : " + weathertom.select("div.weather_main").get(0).text() + ", " + weathertom.select("strong").get(0).text() + "\n        강수확률 : " + weathertom.select("strong").get(1).text();
			weatherStr = weatherStr + "\n\n내일 오후 날씨 : " + weathertom.select("div.weather_main").get(1).text() + ", " + weathertom.select("strong").get(2).text() + "\n        강수확률 : " + weathertom.select("strong").get(3).text();

			replier.reply(weatherStr);
		} catch(e) {
			replier.reply(cmd + " 의 날씨 정보를 가져올 수 없습니다.");
		}
	}
}
function randomItem(a) {
	return a[Math.floor(Math.random() * a.length)];
}
//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
	var textView = new android.widget.TextView(activity);
	textView.setText("에케봇 작동시작!");
	textView.setTextColor(android.graphics.Color.DKGRAY);
	activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}
