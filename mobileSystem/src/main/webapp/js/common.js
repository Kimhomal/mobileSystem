(function($){
	function ready(am) {
		if (document.readyState != 'loading'){
			am();
		} else {
			document.addEventListener('DOMContentLoaded', am);
		}
	}
	
	// serialize 함수. form HTMLElement만 인자값으로 받음
	function formSerialize(form){
		var a = form instanceof HTMLElement ? form : undefined;
		
		if(!a){
			return;
		}
		
		var els = a.elements;
		var se = '';
		var el;
		for(var i = 0; i < els.length; i++){
			el = els.item(i);
			se += el.id + '=' + el.value + '&';
		}
		
		return se.replace(/\&$/, '');
	}
	
	// Namespace "am"
	window.am = window.am || {};

	// Context Path 반환
	window.am.getContextPath = function(){
		var hostIndex = location.href.indexOf( location.host ) + location.host.length;
		return location.href.substring(hostIndex, location.href.indexOf('/', hostIndex + 1))
	}
	
	// 로그인
	window.am.fn_login = function fn_login() {
		
//	    if (document.getElementById('searchUserId') == '') {
//	    	ons.notification.alert('아이디를 입력하세요');
//	        document.getElementById('searchUserId').focus();
//	        return;
//	    }
//	    
//	    if (document.getElementById('#searchUserPwd') == '') {
//	    	ons.notification.alert('패스워드를 입력하세요');
//	        document.getElementById('searchUserPwd').focus();
//	        return;
//	    }

	    document.getElementById('searchUserId').value = 'admin';
	    document.getElementById('searchUserPwd').value = 'qwer1234!';
	    
	    // validation check
	    if (am.fn_userInfo_checked()) {
	        document.loginForm.action = 'main/login.do';
	        document.loginForm.submit();
	    }
	}

	// 로그인전 validation
	window.am.fn_userInfo_checked = function fn_userInfo_checked() {
	    var queryString = formSerialize(document.getElementById('loginForm'));
	    var isChecked = true;

	    $.ajax({
            url: "main/loginChecking.json",
            type: "post",
            dataType: "json",
            data: queryString,
            async: false,
            beforeSend: function (xhs, status) {
            },
            error: function (xhs, status, error) {
            	ons.notification.alert('에러가 발생했습니다. 다시 시도하시거나 관리자에게 문의하세요.');
                console.log(xhs);
                console.log(status);
                console.log(error);
            },
            success: function (resData, textStatus) {
                if (resData.sof == "fail") {
                    isChecked = false;
                    alert(resData.msg);
                } else if (resData.sof == "failPwd") {
                    isChecked = false;
                    $("#passwordUserId").val($("#searchUserId").val());
                    $("#pwdChangeForm").show();
                    $("#modal_pwd_change").modal();
                } else {
                	console.log(resData.msg);
                    if (resData.msg01 != null && resData.msg01 != '' && resData.msg01 !== 'undefined') {
                    	console.log(resData.msg01);
                    }
                }
            }
        });
	    
	    return isChecked;
	}

	// 로그아웃
	window.am.fn_logout = function fn_logout() {
	    ons.notification.confirm('로그아웃 하시겠습니까?').then(function(index){
	    	if(index){
	    		location.href = gp.ctxPath + '/main/logout.do';
	    	}
	    });
	}
	
	// 사이드 메뉴 open
	window.am.sideOpen = function() {
		var menu = document.getElementById('splitter-menu');
		menu.open();
	};

	// 사이드 메뉴 리스트 버튼 클릭 시 해당 페이지로 이동
	window.am.load = function(page) {
		var content = document.getElementById('splitter-content'); // content 영역 element
		var menu = document.getElementById('splitter-menu'); // 사이드 메뉴 element
		
		content.
			load(page).
			then(menu.close.bind(menu)); // content 영역에 해당 페이지 로드 후 사이드 메뉴 닫기
			
	};
	
	// 유저 메뉴 생성(로그아웃, 개인정보보기 등)
	window.am.createUserMenu = function(){
		// ons.openActionSheet API - 하단 메뉴 팝업 (https://onsen.io/v2/api/js/ons-action-sheet-button.html 참조)
		ons.openActionSheet({
			title: 'User menu',
			cancelable: true,
			callback: function(index){
			console.log(index);
			switch(index){
			case 0:
				if(window.am.fn_logout){
					window.am.fn_logout();
				}
				break;
				break;
			case 1:
				if(window.am.fn_logout){
					window.am.fn_logout();
				}
				break;
			default:
			}
			},
			buttons: [/*{icon: 'md-square-o', label: '개인정보'}, */{icon: 'md-square-o', label: '로그아웃', modifier: 'destructive'}]
		});
	}
	
	window.am.StringBuilder = function() {
		this.buffer = new Array();
	}
	
	window.am.StringBuilder.prototype.Append = function(strValue) {
		this.buffer[this.buffer.length] = strValue;
	}
	
	window.am.StringBuilder.prototype.ToString = function() {
		return this.buffer.join("");
	}
	
	ready(function(){
		// document load가 완료되었을 때 실행되는 영역
	});
	
	/**
	 * isEmpty : 비어있는지 확인 return bool
	 * is$Empty : jquery 객체가 비어있는지 확인 return bool
	 * isEmptyAlert : jquery 객체가 비어있는지 확인 후 메시지창 return bool
	 * isLengthBetween : 최소/최대 글자 return bool
	 * isByteBetween : 최소/최대 바이트 return bool
	 * deleteSpace : 공백(space)제거 return string
	 * trimSpace : 맨 앞/뒤 공백제거 return string
	 * lpad : 왼쪽으로 글자 채우기 return string
	 * rpad : 오른쪽으로 글자 채우기 return string
	 * byteSize : 바이트 크기 return string
	 *
	 */
	$.fn.extend({
		isEmpty : function() {
			if($(this).val() == "" || $(this).val() == null) {
				return true;
			} else {
				return false;
			}
		},
		isEmptyAlert : function(names, gbn) {
			if($(this).is$Empty()){
				alert("존재하지 않은 객체:"+names);
				return true;
			}
			if($(this).prop("type") == "text" || $(this).prop("type") == "textarea") {
				if($(this).val() == null || $(this).val().replace(/ /gi,"") == "" || $(this).val() == gbn){
					alert(names + "을(를) 입력하십시오.");
					$(this).focus();
					return true;
				}
			} else if ($(this).prop("type") == "select" || $(this).prop("type") == "select-one" || $(this).prop("type") == "select-multiple"){
				if($(this).val() == null || $(this).val().replace(/ /gi,"") == "" || $(this).val() == gbn){
					alert(names + "을(를) 선택하십시오.");
					$(this).focus();
					return true;
				}
			} else if ( $(this).prop("type") == "file") {
				if($(this).val() == null || $(this).val().replace(/ /gi,"") == "" || $(this).val() == gbn) {
					alert(names + "을(를) 선택하십시오.");
					$(this).focus();
					return true;
				}
			}
			return false;
		},
		is$Empty : function() {
			if($(this).length == 0) {
				return true;
			} else {
				return false;
			}
		},
		isLengthBetween : function(min, max) {
			var length = $(this).val().length;

			if(min <= length && length <= max) {
				return true;
			} else {
				return false;
			}
		},
		isByteBetween : function(min, max) {
			var byteSize = $(this).byteSize();

			if(min <= byteSize && byteSize <= max) {
				return true;
			} else {
				return false;
			}
		},
		deleteSpace : function() {
			var val = $(this).val();
			val = val.replace(/ /g, "");	//space
			val = val.replace(/	/g, "");	//tab
			$(this).val(val);
		},
		trimSpace : function() {
			var val = $(this).val();
			val = $.trim(val);
			$(this).val(val);
		},
		lpad : function(totalLen, strRepl) {
			var strAdd = "";
			var diffLen = totalLen - $(this).val().length;

			for(var i = 0; i < diffLen; i++) {
				strAdd += strRepl;
			}

			var val = strAdd + $(this).val();

			$(this).val(val);
		},
		rpad : function(totalLen, strRepl) {
			var strAdd = "";
			var diffLen = totalLen - $(this).val().length;

			for(var i = 0; i < diffLen; i++) {
				strAdd += strRepl;
			}

			var val = $(this).val() + strAdd;

			$(this).val(val);
		},
		byteSize : function() {
			var val = $(this).val();
			var byteSize = 0;

			for(var i = 0; i < val.length; i++) {
				if(val.charCodeAt(i) > 255) {
					byteSize += 2;
				} else {
					byteSize += 1;
				}
			}
			return byteSize;
		},
		toUnderscore : function() {
			var val = $(this).val();
			return val.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
		}
	});

	$.extend({
		isEmpty : function(str) {
			if(str == "" || str == null) {
				return true;
			} else {
				return false;
			}
		},
		is$Empty : function($elem) {
			if($elem.length == 0) {
				return true;
			} else {
				return false;
			}
		},
		isLengthBetween : function(str, min, max) {
			var length = str.length;

			if(min <= length && length <= max) {
				return true;
			} else {
				return false;
			}
		},
		isByteBetween : function(str, min, max) {
			var byteSize = $.byteSize(str);

			if(min <= byteSize && byteSize <= max) {
				return true;
			} else {
				return false;
			}
		},
		deleteSpace : function(str) {
			var val = str.replace(/ /g, "");	//space
			val = val.replace(/	/g, "");	//tab

			return val;
		},
		trimSpace : function(str) {
			var val = $.trim(str);

			return val;
		},
		lpad : function(str, totalLen, strRepl) {
			var strAdd = "";
			var diffLen = totalLen - str.length;

			for(var i = 0; i < diffLen; i++) {
				strAdd += strRepl;
			}

			return strAdd + str;
		},
		rpad : function(str, totalLen, strRepl) {
			var strAdd = "";
			var diffLen = totalLen - str.length;

			for(var i = 0; i < diffLen; i++) {
				strAdd += strRepl;
			}

			return str + strAdd;
		},
		byteSize : function(str) {
			var val = str;
			var byteSize = 0;

			for(var i = 0; i < val.length; i++) {
				if(val.charCodeAt(i) > 255) {
					byteSize += 2;
				} else {
					byteSize += 1;
				}
			}

			return byteSize;
		},
		toUnderscore : function(str) {
			return str.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
		}
	});
	
	//Automatically cancel unfinished ajax requests
	//when the user navigates elsewhere.
	$.xhrPool = [];
	$.xhrAbort = function() {
		$.each($.xhrPool, function(idx, jqXHR) {
			jqXHR.abort();
		});
	};

	var oldbeforeunload = window.onbeforeunload;
	window.onbeforeunload = function() {
		var r = oldbeforeunload ? oldbeforeunload() : undefined;
		if (r == undefined) {
			$.xhrAbort();
		}
		return r;
	}

	$(document).ajaxSend(function(e, jqXHR, options) {
		$.xhrPool.push(jqXHR);
	});
	$(document).ajaxComplete(function(e, jqXHR, options) {
		$.xhrPool = $.grep($.xhrPool, function(x) {
			return x != jqXHR
		});
	});


	$.xhrCheckData = function(data) {
		if (typeof data == "undefined") return false;

		if (data.hasOwnProperty("error")) {
			var errorCode = data["error"];

			switch (errorCode) {
				case "401":
					$.xhrAbort();
//					alert("로그인후 다시 시도하세요. / Ajax 요청 실패");
//					top.location.href = G.baseUrl + "user/auth/login.do";
				break;
				default:
					alert("Ajax 요청 실패 / [" + errorCode + "] " + data["message"]);

				break;
			}

			return false;

		} else {
			return true;

		}
	}
	
	$.fn.extend({
		getFormToJsonData : function() {

			var params = {};

			var arr = $(this).serializeArray();

			$.each(arr, function(){
				var name;
				$.each(this, function(key, value){
					if (key == "name") {
						name = value;
					} else if(key == "value") {
						if(!$.isEmpty(value)) {
							params[name] = $.trim(value);
						}else{
							params[name] = "";
						}
					}
				});
			});

			return params;
		},
		isEmptyAlertForm : function() {
			var bValidation = false;

			var $tr = $(this).find("table>tbody>tr");

			$tr.each(function(){
				var $th = $(this).children("th");

				if($th.children("span.necesaary").length > 0) {
					var strTh = $th.text().replace("*", "");

					var $component = $(this).children("td").find("input, select, file, textarea");

					$component.each(function(){
						if(!$(this).is("[type='hidden']") && !$(this).is(':hidden')) {
							if(!$(this).is("[type='file']")) $(this).trimSpace();

							if($(this).isEmptyAlert(strTh)) {
								bValidation = false;
								return false;
							} else {
								bValidation = true;
							}
						}
					});
				} else {
					bValidation = true;
				}

				return bValidation;
			});

			return bValidation;
		},
	});
}(jQuery));