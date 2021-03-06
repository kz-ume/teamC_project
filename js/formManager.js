function FormManager() {
    //================== コンストラクタ ==================//
    var searchButton = document.getElementById('search-button');
    searchButton.onclick = function() {
        clicked = true;
    }
    
    var selectedIdName = "";
    var select5ButtonArray = [];
    //なんかまとめたい
    select5ButtonArray.push(document.getElementById("chinryo"));
    select5ButtonArray.push(document.getElementById("mennseki"));
    select5ButtonArray.push(document.getElementById("ekitoho"));
    select5ButtonArray.push(document.getElementById("new"));
    select5ButtonArray.push(document.getElementById("high"));
    select5ButtonArray.push(document.getElementById("heyasuu"));
   
    var chikunensu = new FormPulldowm('chikunensu',
        [
            {'text': '', 'cond': {}},
            {'text': '新築（築1年以内）', 'cond': {'chikunensu.to': 1}},
            {'text': '3年以内', 'cond': {'chikunensu.to': 3}},
            {'text': '5年以内', 'cond': {'chikunensu.to': 5}},
            {'text': '10年以内', 'cond': {'chikunensu.to': 10}},
            {'text': '15年以内', 'cond': {'chikunensu.to': 15}},
            {'text': '20年以内', 'cond': {'chikunensu.to': 20}},
            {'text': '30年以内', 'cond': {'chikunensu.to': 30}},
        ]
    );
    var sikikin = new FormCheckboxChecked('shikikin', 'shikikin');
    var reikin = new FormCheckboxChecked('reikin', 'reikin');
    var chinryo_from = new FormTextNumber('chinryo_from', 'chinryo.from');
    var chinryo_to = new FormTextNumber('chinryo_to', 'chinryo.to');
    var madori = new FormCheckboxList('madori', 'madori');
    var ekitoho = new FormCheckboxList('ekitoho','ekitoho');
    var forms = [
        chikunensu,
        sikikin,
        reikin,
        chinryo_from,
        chinryo_to,
        madori,
        ekitoho
    ];

    var clicked = false;
    //5つ選ぶかどうかのフラグ
    var select5 = false;
    
    //===================== メソッド =====================//
    this.isClicked = function() {
        return clicked;
    }
//    this.checkSelected =function(){
//        for(var i=0;i<select5ButtonArray.length;i++){
//            select5ButtonArray[i].onclick = function(){
//                selectedIdName = select5ButtonArray[i];
//                select5 = true;
//                return;
//            }
//        }
//        select5 = false;
//    }
     //上位５個選ぶボタンが押されてるか確認
    this.checkSelected = function(){
        for(var i=0;i<select5ButtonArray.length;i++){
            if(select5ButtonArray[i].checked){
                selectedIdName = select5ButtonArray[i];
                select5 = true;
                return;
            }
        }
        select5 = false;
    }
    this.select5isClicked = function(){
        return select5;
    }
    this.getSelectedId = function(){
        return selectedIdName.id;
    }
    this.getCond = function() {
        clicked = false;
        var cond = {};
        for (var form of forms) {
            var c = form.getCond()
            for (var key in c) {
                cond[key] = c[key];
            }
        }
        return cond;
    }
}

function FormCheckboxChecked(elemId, columnName) {
    //================== コンストラクタ ==================//
    var element = document.getElementById(elemId);

    //===================== メソッド =====================//
    this.getCond = function() {
        var cond = {};
        if (element.checked) {
            cond[columnName] = 0;
        }
        return cond;
    }
}

function FormCheckboxList(elemName, columnName) {
    //================== コンストラクタ ==================//
    var elements = document.getElementsByName(elemName);

    //===================== メソッド =====================//
    this.getCond = function() {
        var values = [];
        for (var elem of elements) {
            if (elem.checked) {
                values.push(elem.value);
            }
        }
        var cond = {};
        if (values.length) {
            cond[columnName + '.in'] = values;
        }
        return cond;
    }
}

function FormTextNumber(elemId, columnName) {
    //================== コンストラクタ ==================//
    var element = document.getElementById(elemId);

    function isValid() {
        if (element.value.match(/\d+/)) {
            return true;
        } else {
            return false;
        }
    }

    //===================== メソッド =====================//
    this.getCond = function() {
        var cond = {};
        if (isValid()) {
            cond[columnName] = parseInt(element.value);
        }
        return cond;
    }
}

function FormPulldowm(elemId, optionList) {
    //================== コンストラクタ ==================//
    var element = document.getElementById(elemId);

    var conds = [];
    var innerHTML = '';
    for (var option of optionList) {
        var dom = document.createElement('option');
        dom.innerHTML = option.text;
        innerHTML += dom.outerHTML;
        conds.push(option.cond);
    }
    element.innerHTML = innerHTML;

    //===================== メソッド =====================//
    this.getCond = function() {
        var selected = element.selectedIndex;
        return conds[selected];
    }

}
