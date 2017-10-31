// --------------------------------------------------------------------
//
// ==UserScript==
// @name          淘宝返利显示
// @namespace     https://github.com/kingems/tbflxs
// @version       0.1.2
// @author        kingem(kingem@126.com)
// @description   淘宝返利显示
// @grant         GM_log
// @grant         GM_xmlhttpRequest
// @require       https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js
// @include       *://detail.ju.taobao.com/*
// @include       *://chaoshi.detail.tmall.com/*
// @include       *://world.taobao.com/*
// @include       *://detail.tmall.com/*
// @include       *://item.taobao.com/*
// @run-at        document-end
// ==/UserScript==
//
// --------------------------------------------------------------------
(function(){
    var itemId = "";
    var sellerId ="";
    var token = "";
	var pvid ="";
	var shopKeeperId = "";
    var quanList=new Array();
    var rateList=new Array();
    var urlhost = "item.taobao.com";
	function getQueryString(name){
		var reg=new RegExp("(^|&)"+name+"=([^&]*)(&|$)","i");
		var r=window.location.search.substr(1).match(reg);
		if(r!=null)return unescape(r[2]);
		return null;
	}
	function getQueryStringByUrl(url,name){
		var myUrl=url.substring(url.indexOf("?")+1);
		var reg=new RegExp("(^|&)"+name+"=([^&]*)(&|$)","i");
		var r=myUrl.match(reg);
		if(r!=null)return unescape(r[2]);
		else return"";
	}

	function getSellerId(){
		var url=window.location.href;
		if(url.indexOf('detail.ju.taobao.com')!=-1){
			return $('.J_RightRecommend').attr('data-sellerid');
		}else if(url.indexOf('chaoshi.detail.tmall.com')!=-1){
			var d=$("#J_SellerInfo").attr("data-url");
			var e=d.match(/user_num_id=(\d+)/g);
			var f=String(e).split("=");
			return f[1];
		}else if(url.indexOf('world.taobao.com')!=-1){
			var d=$("#J_listBuyerOnView").attr("data-api");
			var e=d.match(/seller_num_id=(\d+)/g);
			var f=String(e).split("=");
			return f[1];
		}else{
			var meta=$('meta[name=microscope-data]').attr('content');
			if(meta){
				var userid=/userid=(\d+)/.exec(meta)[1];
				return userid;
			}
		}
	}

	function insertHtml(){
		if($("#fanliTipParent").length<=0){
			var containHtml='<a id="loginlm_btn" href="https://www.alimama.com/member/login.htm" target="_blank" style="color:red">点击登录淘宝联盟</a></td></tr><div id="fanliTipParent"><div id="myfanli"><a id="myfanliA" >正在查询中</a></div><div id="bifanliTable"><table id="fanlitable" border="1" cellpadding="0" cellspacing="0"><thead> <tr><th width="40">计划</th><th width="50">类型</th><th width="50">比例</th><th width="50">详情</th></tr></thead><tbody></tbody><tfoot></tfoot></table></div></div>';
            if(window.location.href.indexOf("detail.tmall.com")>-1){
				urlhost='detail.tmall.com';
				$(".tb-meta").append(containHtml);
			}else if(window.location.href.indexOf("item.taobao.com")>-1){
				$("ul.tb-meta").after(containHtml);
            }else{
                $("body").append(containHtml);
            }
			getPubCampaignid();

		}
	}

	function getPubCampaignid(){
		GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://pub.alimama.com/shopdetail/campaigns.json?oriMemberId='+sellerId+'&_input_charset=utf-8',
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
            	var data=JSON.parse(response.responseText).data;
				if(data.campaignList && data.campaignList.length > 0){
					$("#loginlm_btn").html("淘宝联盟已登录");
                    getToken();
					getPvid();
                    setTimeout(function(){
	        			getshopKeeperId();
			    	},1000);
				}
			}
		});
	}
	function getToken(){ //获取token
		GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://alimama.com',
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
                var reg=new RegExp("'_tb_token_'.*?value='(.*?)'","i");
                var tokens = response.responseText.match(reg);
                if (tokens){
                    token = tokens[1];
                }
            }
		});
	}
	function getPvid(){
		GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://pub.alimama.com/items/search.json?q=http%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D'+itemId+'&perPageSize=40',
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
            	var data=JSON.parse(response.responseText).data;
				if(data){
					pvid = data.head.pvid;
                }
            }
        });
	}
    function getshopKeeperId(){
		GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://pub.alimama.com/shopdetail/campaigns.json?oriMemberId='+sellerId+'&t='+new Date().getTime()+'&_tb_token_='+token+'&pvid='+pvid+'&_input_charset=utf-8',
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
            	var data=JSON.parse(response.responseText).data;
				if(data){
					if(data.campaignList && data.campaignList.length > 0){
						var pagelist = data.campaignList;
						shopKeeperId=pagelist[0].shopKeeperId;
                    }
                    getDingxiang();
                    setTimeout(function(){
	        			getTongyong();
			    	},2000);
				}
            }
        });
	}

	function getTongyong(){
		GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://pub.alimama.com/items/search.json?q=http%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D'+itemId+'&t='+new Date().getTime()+'&_tb_token_='+token+'&pvid='+pvid,
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
            	var data=JSON.parse(response.responseText).data;
				if(data){
					var tkRate = data.pageList[0].tkRate;
					var totalNum = data.pageList[0].totalNum;
                    var totalFee = data.pageList[0].totalFee;
                    var eventRate = data.pageList[0].eventRate;
                    var cpshtml = '<br>通用佣金比例'+tkRate+'%,30天总支出佣金'+totalFee+'元,推广量'+totalNum+'件</br>';
					$("#loginlm_btn").append(cpshtml);
					var trItem ='<tr><td class="valueTd">通用'+tkRate+'%</td><td>通用计划</td><td>'+tkRate+'%</td><td><a target="_blank" style="color:red" href="http://pub.alimama.com/promo/search/index.htm?q=http%3A%2F%2F'+urlhost+'%2Fitem.htm%3Fid%3D'+itemId+'">详情</td></tr>';
                    $("#bifanliTable #fanlitable tbody").prepend(trItem);
                    $("#myfanliA").html("有返利计划");
                    if (eventRate){
						trItem ='<tr><td class="valueTd">高返'+eventRate+'%</td><td>高返计划</td><td>'+eventRate+'%</td><td><a target="_blank" style="color:red" href="http://pub.alimama.com/promo/item/channel/index.htm?spm=2013.1.iteminfo.6.61d9a807Z1wYc&q=http%3A%2F%2F'+urlhost+'%2Fitem.htm%3Fid%3D'+itemId+'&channel=qqhd">详情</td></tr>';
	                    $("#bifanliTable #fanlitable tbody").prepend(trItem);
	                    $("#myfanliA").html("有高返");
                    }
                }else{
                    $("#myfanliA").html("没有返利计划");
                }
            }
        });
	}

	function getDingxiang(){
        GM_xmlhttpRequest({
            method: 'GET',
            url:'http://pub.alimama.com/items/channel/qqhd.json?spm%3D2013.1.iteminfo.6.61d9a807Z1wYc&q=http%3A%2F%2F'+urlhost+'%2Fitem.htm%3Fid%3D'+itemId+'&channel=qqhd&perPageSize=40'+'&t='+new Date().getTime()+'&_tb_token_='+token+'&pvid='+pvid,
            overrideMimeType:"text/html;charset=utf-8",
            onload: function(response) {
                var data=JSON.parse(response.responseText).data;
            	if(data){
            		if(data.pageList && data.pageList.length > 0){
						var pagelist = data.pageList;
						var tkSpecialCampaignIdRateMap =pagelist[0].tkSpecialCampaignIdRateMap;
						for(var key in tkSpecialCampaignIdRateMap){
							rateList.push(tkSpecialCampaignIdRateMap[key]);
						}
						rateList.sort(function sortNumber(a,b){
                            return b - a;
                        });
						for (var i = 0; i<rateList.length;i++){
							var rate = 	rateList[i];
							for(var key in tkSpecialCampaignIdRateMap){
								if (rate==tkSpecialCampaignIdRateMap[key] && $.inArray(key,quanList)<0){
									quanList.push(key);
									break;
								}
							}
						}
                    	GM_xmlhttpRequest({
				            method: 'GET',
				            url:'http://pub.alimama.com/campaign/campaignDetail.json?campaignId='+quanList[0]+'&shopkeeperId='+shopKeeperId,
				            overrideMimeType:"text/html;charset=utf-8",
				            onload: function(response) {
				                var data=JSON.parse(response.responseText).data;
				            	if(data){
				            		var rate = rateList[0];
			                        var trItem ='<tr><td class="valueTd">定向'+rate+'%</td><td>定向计划</td><td>'+rate+'%</td><td><a target="_blank" style="color:red" href="http://pub.alimama.com/promo/item/channel/index.htm?spm=2013.1.iteminfo.6.61d9a807Z1wYc&q=http%3A%2F%2F'+urlhost+'%2Fitem.htm%3Fid%3D'+itemId+'&channel=qqhd">详情</td></tr>';
		                            $("#bifanliTable #fanlitable tbody").prepend(trItem);
		                        	$("#myfanliA").html("有定向计划");
		                        }else{
                                    $("#myfanliA").html("没有定向计划");
                                }
		                    }
		                });
                    }
            	}else{
            		$("#myfanliA").html("没有定向计划");
            	}

		    }
        });
	}

    setTimeout(function(){
        itemId = getQueryString("id");
        sellerId=getSellerId();
        insertHtml();
	}, 500);
})();
