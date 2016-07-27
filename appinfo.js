/**
 * ��װ��App�ṩ��jsbridge����HTML5ҳ���app��⹦���ṩ֧�֣������¼���
 * Ŀǰ֧�֣���Ѷ���ţ�
 * �÷�
 * 1.�ж��Ƿ�װĳӦ�ã�
 * Appinfo.isInstall(options,success,failed);
 *
 * Appinfo.isInstall({
 *  "packageName":"com.tencent.qqlive",
 *  "openUrl":"tenvideo2://"
 * },function(version) {
 *      //version��
 * },function() {
 *      //uninstall
 * });
 *
 * 2.����ָ��app
 * Appinfo.open(options);
 * Appinfo.open({
 *  "packageName":"com.tencent.qqlive",
 *  "openUrl":"tenvideo2://"
 * });
 *
 */
var Appinfo = {

    init: function() {
        var ua = this.uasniffer(navigator.userAgent);
        //�ж�android,ios
        if (this.api[ua]) {
            return this.api[ua];
        }
        return null;
    },
    isInstall: function(options, success, failed) {
        var adapter = this.init();
        if (adapter) {
            //options����
            adapter.isInstall(options, success, failed);
        } else {
            failed();
        }
    },
    open: function(options) {
        var adapter = this.init();
        if (adapter) {
            //options����
            adapter.open(options);
        } else {
            //������
        }
    },
    //�ƶ��˻���˵ֻ������������������webview�����
    uasniffer: function(ua) {
        var s = ua.toLowerCase();
        if (s.indexOf("micromessenger") > -1) {
            return "wx";
        } else if (s.indexOf("mqqbrowser") > -1) {
            return "mqq";
        }
        if (s.indexOf("qqnews") > -1) {
            return "qqnews";
        }
        if (s.indexOf("qq") > -1) {
            return "qq";
        }
        return ua;
        // "MicroMessenger/5.4.0.51" ΢��
        // "MQQBrowser/5.3" QQ�����
        // "QQ/5.0.0.2215" ��Q
        // "Weibo" ����΢��
        // "TXMicroBlog445" ��Ѷ΢��
        // "qqnews/4.2.4" ��Ѷ����
    },
    load: function(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    function openClientOnOther() {
        window.location.replace('qqmap://map/routeplan?type={{params.type}}&from=' + sdword[0] + '&fromcoord={{params.startLat}},{{params.startLng}}&to=' + sdword[1] + '&tocoord={{params.endLat}},{{params.endLng}}');
    }
    api: (function() {
        return {
            "wx": {
                ready: function(callback) {
                    if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                        callback();
                    } else {
                        if (document.addEventListener) {
                            document.addEventListener("WeixinJSBridgeReady", callback, false);
                        } else if (document.attachEvent) {
                            document.attachEvent("WeixinJSBridgeReady", callback);
                            document.attachEvent("onWeixinJSBridgeReady", callback);
                        }
                    }
                },
                isInstall: function(options, success, failed) {
                    this.ready(function() {
                        WeixinJSBridge.invoke("getInstallState", {
                            "packageUrl": options['openUrl'],
                            "packageName": options['packageName']
                        }, function(res) {
                            var msg = res.err_msg;
                            var p = msg.indexOf("yes_");
                            if (p > -1) {
                                success(msg.substr(p + 4));
                                // return res.err_msg.substr()
                            } else {
                                //"failed:get_install_state:no"
                                failed(res.err_msg);
                            }
                        });
                    });
                },
                open: function(options) {
                    //openUrl����ṩ����·��
                    var ifr = document.createElement('iframe');
                    ifr.src = options['openUrl'];
                    document.body.appendChild(ifr);
                    // window.location.href = options['openUrl'];
                }
            },
            //android
            "qqnews": {
                isInstall: function(options, success, failed) {
                    if (window.TencentNewsScript && window.TencentNewsScript.getAppVersionName) {
                        success(window.TencentNewsScript.getAppVersionName(options['packageName']));
                    } else {
                        failed();
                    }
                },
                open: function(options) {
                    //alert("qqnews open"+options['openUrl']);
                    if (window.TencentNewsScript && window.TencentNewsScript.openApp) {
                        window.TencentNewsScript.openApp(options['openUrl'], options['packageName']);
                    }
                }
            },
            "mqq": {
                ready: function(callback) {
                    Appinfo.load("http://qzs.qq.com/open/mobile/jsbridge/jsbridge.js", callback);
                },
                isInstall: function(options, success, failed) {
                    this.ready(function() {
                        JsBridge.getAppInstalledVersion([options['packageName']], function(result) {
                            success(result[options['packageName']]);
                        });
                    });
                },
                open: function(options) {
                    this.ready(function() {
                        JsBridge.startApp(options['packageName'], "");
                    });
                }
            }
        }
    }())
}