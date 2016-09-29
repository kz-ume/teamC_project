/**
 * 物件データのロード、加工、検索を行う
 * ロードと加工に関しては別クラスに分離している
 */
function DataManager() {
    "use strict";
    //================== コンストラクタ ==================//
    var loader = new BukkenDataLoader();

    //===================== 内部関数 =====================//
    function makeFilters(cond) {
        /**
         * フィルター関数の作成を行う関数群
         */
        function makeEqFilter(key) {
            var cond_value = cond[key];
            return function(data) {
                return data[key] === cond_value;
            }
        }
        function makeLeFilter(key) {
            var cond_value = cond[key];
            var data_key = key.slice(0, -3);
            return function(data) {
                return data[data_key] <= cond_value;
            }
        }
        function makeGeFilter(key) {
            var cond_value = cond[key];
            var data_key = key.slice(0, -5);
            return function(data) {
                return data[data_key] >= cond_value;
            }
        }
        function makeInFilter(key) {
            var cond_value = cond[key];
            var data_key = key.slice(0, -3);
            return function(data) {
                return cond_value.includes(data[data_key]);
            }
        }

        /**
         * 配列に対して適用するフィルター群を検索条件をもとに作成する
         * key の末尾に応じて検索方法を変更する
         *    + '.to'：上限
         *    + '.from'：下限
         *    + '.in': 包含
         *    + その他：厳密一致
         */
        var filters = [];
        for (var key in cond) {
            if (cond[key] == null) continue;
            if (key.slice(-3) === '.to') {
                filters.push(makeLeFilter(key));
            } else if (key.slice(-5) === '.from') {
                filters.push(makeGeFilter(key));
            } else if (key.slice(-3) === '.in') {
                filters.push(makeInFilter(key));
            } else {
                filters.push(makeEqFilter(key));
            }
        }
        return filters;
    }

    //===================== メソッド =====================//
    this.search = function(cond) {
        var dataList = loader.getDataList();
        var filters = makeFilters(cond);
        return dataList.filter(function(data) {
            return filters.every(function(e, i, a) {
                return e(data);
            });
        })
    }
    
    //最小もしくは最大の5つを返す
    this.selectBest5 = function(bukkenInfoList,target){
        //昇順-true,降順-false
        var ascending = true;
        switch(target){
            case "new": 
                target = "chikunensu";
                ascending = true;
                break;
            case "mennseki":
                ascending = false;
                break;
            case "high":
                ascending = false;
                break;
            case "heyasuu":
                ascending = false;
                break;
                
            default:
                break;
        }
        var bestBukkenArray = [];
    
        //昇順にソート
        if(ascending){
            bukkenInfoList.sort(function(a,b){
                var aTemp = a[target];
                var bTemp = b[target];
                if(aTemp < bTemp) return -1;
                if(aTemp > bTemp) return 1;
                return 0;
            });
        }else{
            //降順
            bukkenInfoList.sort(function(a,b){
                var aTemp = a[target];
                var bTemp = b[target];
                if(aTemp > bTemp) return -1;
                if(aTemp < bTemp) return 1;
                return 0;
            });
    }
//                //nullを除く
//        var nullRemovedList = bukkenInfoList.filter(function(v,i){
//            return (v!==null);
//        })

        
        //重複を除く
        var tempBukkenList = {};
        for(var i=0;i < bukkenInfoList.length;i++){
            tempBukkenList[bukkenInfoList[i]["tatemono_name"]] = bukkenInfoList[i];
        }
        var uniqueBukkenList = [];
        for(var key in tempBukkenList){
            uniqueBukkenList.push(tempBukkenList[key]);
            }

        for(var i=0;i<5;i++){
            bestBukkenArray.push(uniqueBukkenList[i]);
        }
        return bestBukkenArray;
    }
}


/**
 * 物件データのロードと加工を行う
 */
function BukkenDataLoader() {
    //================== コンストラクタ ==================//
    var bukkenDataList = [];
    load();

    //===================== 内部関数 =====================//
    /**
     * 物件データを取得する
     */
    function load() {
        for (var i = 0; i < 10; i++) {
            $.get('http://192.168.10.2/chinshaku_' + ('00' + i).slice(-3) + '_.json',
                  function(items) {
                      for (var rawData of items) {
                          bukkenDataList.push(modifyChinshaku(rawData));
                      }
                  }
            )
        }
    }

    /**
     * いい生活データをパースする
     */
    function modifyChinshaku(rawData) {
        var data = {};
        // 物件名称
        if (rawData.tatemono_name) {
            data.tatemono_name = rawData.tatemono_name.trim();
        } else {
            data.tatemono_name = '';
        }
        // 緯度・経度
        data.lat = rawData.ido / 3600000;
        data.lng = rawData.keido / 3600000;
        // 賃料、敷金、礼金[円]
        data.chinryo = rawData.chinshaku_boshu_joken_view.chinryo;
        data.shikikin = rawData.chinshaku_boshu_joken_view.shikikin_en;
        data.reikin = rawData.chinshaku_boshu_joken_view.reikin_en;
        // 築年数
        if (rawData.shunko_datejun) {
            shunko_date = parseDatejun(rawData.shunko_datejun);
            var now = new Date();
            // 近似的に年数を計算。うるう年があるとずれる
            data.chikunensu = Math.floor((now - shunko_date) / (1000*60*60*24*365));
        }
        // 間取り。like 1K、1R、2LDK
        data.madori = rawData.madori_name;
        data.ekitoho =""+ rawData.kotsu_ekitoho_1;
        //階段数
        data.high = rawData.shozaikai;
        data.heyasuu = rawData.madori_heyasu;
        data.keiyaku = rawData.keiyaku_kikan;
        return data;
    }

    /**
     * 年月日旬[int]→年月日[Date]
     */
    function parseDatejun(datejun) {
        var jun = datejun % 10;
        var day = datejun / 10 % 100;
        var month = datejun /1000 % 100;
        var year = datejun / 100000;
        // 近似的に上旬→1日、中旬→11日、下旬→21日
        if (day === 0) {
            if (jun === 1) {
                day = 1;
            } else if (jun === 2) {
                day = 11;
            } else if (jun === 3) {
                day = 21;
            }
        }
        // JSでは1月=0、2月=1、・・・、12月=11
        return new Date(year, month-1, day);
    }

    //===================== メソッド =====================//
    this.getDataList = function() {
        return bukkenDataList;
    }
}
