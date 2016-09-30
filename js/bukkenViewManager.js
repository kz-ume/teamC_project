/**
 * @author raito.ochi
 */

/**
 * ピン（マーカー）の情報を扱うクラス
 */
function BukkenViewManager(map) {
    //================== コンストラクタ ==================//
    var pins = [];   // ピンのオブジェクトの配列

    //===================== メソッド =====================//
    /**
     * 物件情報のリストを受け取り、ピンを立てる。
     */
    this.update = function(bukkenInfoList) {
        // pinsの初期化
        for (var pin of pins) {
            pin.del();
            delete pin;
        }
        pins.length = 0;
        // ピンのオブジェクトの配列を新しく作成
        for (var bukkenInfo of bukkenInfoList) {
            var testPin = new Pin(bukkenInfo,map);
            pins.push(testPin);
        }
    }
        //上位５件の物件情報を表示する
        this.displayBestFive = function(bukkenArray){
        var bukkenInfo = bukkenArray;
        for(var i=0;i<bukkenInfo.length;i++){
           
            insertHTMLElement('bukken'+i,generateHTMLElement(bukkenInfo[i],i));
        }
    }
}

/**
 * ピンのオブジェクト
 */
function Pin(bukkenInfo, map) {
    //================== コンストラクタ ==================//
    var marker = new google.maps.Marker({     // Google Map上のマーカーのオブジェクト
        map: map,
        position: new google.maps.LatLng(bukkenInfo.lat, bukkenInfo.lng),
//        scaledSize: new google.maps.Size(100, 48),
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=京|7FFF00|000000'
    });
    
    function highlightMarker(marker, highlight) {
    var color = "#FE7569";
    if (highlight) {
        color = "#0000FF";
    }
    marker.setImage(getIcon(color).image);
}

    // 地図上のマーカーがクリックされた際に呼ばれるイベントハンドラの設定
    google.maps.event.addListener(marker, 'click', onClick.bind(this));

    //===================== メソッド =====================//
    /**
     * マーカーの画像を設定する
     */
    this.setIcon = function(url) {
        marker.setIcon(url);
    }
    /**
     * 地図上のマーカーがクリックされた際の処理
     */
    function onClick() {

     var tatemonos = document.getElementsByClassName("tatemono_matome");
        var _tatemono = document.getElementsByClassName("tatemono");
     var clicked = document.getElementById(bukkenInfo["tatemono_name"]);

     // 物件情報を画面に表示
     if (best5search_flag == false) {
         console.log(best5search_flag);
         for (var j = 1; j < 5; j=j+1) {
             console.log(j);
             _tatemono[j].textContent = null;
         
         }
        insertHTMLElement('bukken0', generateHTMLElement(bukkenInfo, -1));
         

     } else if (best5search_flag == true) {

         for (var i = 0; i < tatemonos.length; i++) {
             tatemonos[i].style.backgroundColor = "";
         }
         clicked.style.backgroundColor = "yellow";
     }
 }


    // pinを消す
    this.del = function() {
        if (marker) {
            marker.setMap(null);
            delete marker;
        }
    }
}

/**
 * 物件情報のHTML要素を生成
 */
function generateHTMLElement(bukkenInfo,rank) {
    var element = document.createElement('div');
    element.setAttribute('id', bukkenInfo["tatemono_name"]);
    element.setAttribute('class', 'tatemono_matome');
    var innerHTML="";
    if(rank<0){
         var rankstring =""; 
    }
    else{
        var ranknumber=rank+1;
        var rankstring=ranknumber+"位";
    }
    innerHTML = innerHTML+'\
            <div id="tatemono_name" class="tatemono-name" >'+rankstring+'　<#tatemono_name></div>\
            <div id="bukken-image" class="image"></div>\
            <div id="cotent" class="content-text">\
                <table class="table">\
                    <tr>\
                        <td>築</td>\
                        <td><#chikunensu></td>\
                        <td>年</td>\
                    </tr>\
                    <tr>\
                        <td>賃料</td>\
                        <td><#chinryo></td>\
                        <td>円</td>\
                    </tr>\
                    <tr>\
                        <td>敷金</td>\
                        <td><#shikikin></td>\
                        <td>円</td>\
                    </tr>\
                    <tr>\
                        <td>礼金</td>\
                        <td><#reikin></td>\
                        <td>円</td>\
                    </tr>\
                    <tr>\
                        <td>間取り</td>\
                        <td><#madori></td>\
                    </tr>\
                </table>\
        </div>';

    // 物件情報を置換
    innerHTML = innerHTML.replace('<#tatemono_name>', escapeText(bukkenInfo.tatemono_name));
    innerHTML = innerHTML.replace('<#tatemono_name>', escapeText(bukkenInfo.tatemono_name));
    innerHTML = innerHTML.replace('<#chikunensu>', bukkenInfo.chikunensu);
    innerHTML = innerHTML.replace('<#chinryo>', bukkenInfo.chinryo);
    innerHTML = innerHTML.replace('<#shikikin>', bukkenInfo.shikikin);
    innerHTML = innerHTML.replace('<#reikin>', bukkenInfo.reikin);
    innerHTML = innerHTML.replace('<#madori>', bukkenInfo.madori);

    element.innerHTML = innerHTML;
    return element;
}

/**
 * 特殊な意味を持つ文字をエスケープする
 */
function escapeText(text) {
    return text.replace(/[&'`"<>]/g, function(match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}

/**
 * HTML要素を、指定したidを持つ要素内に挿入
 */
function insertHTMLElement(id, element) {
    var target = document.getElementById(id);
    console.log(target);
    
    target.innerHTML = '';
    target.appendChild(element);
}
