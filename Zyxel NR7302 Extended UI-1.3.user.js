// ==UserScript==
// @name         Zyxel NR7302 Extended UI
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Inject enhanced signal dashboard for Zyxel router, fully sandbox-safe
// @author       dmxpowa
// @match        *://195.3.85.241:20443/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- Load CryptoJS if missing ---
    function loadCryptoJS(callback) {
        if (typeof CryptoJS !== "undefined") {
            callback();
            return;
        }
        let s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
        s.onload = callback;
        document.head.appendChild(s);
    }

    loadCryptoJS(() => {
        console.log("CryptoJS loaded");

        // --- Globals ---
        window.gw = 500;
        window.gh = 30;
        window.gt = 3;
        window.signal = "";
        window.version = "zyxel Family-v2.0a";
        window.arsrp = [];
        window.arsrq = [];
        window.asinr = [];
        window.anr5rsrp = [];
        window.anr5rsrq = [];
        window.anr5sinr = [];
        window.boxcar = window.gw / (window.gt + 1);

        console.log("Code by Miononno mod by Riskio87-" + window.version);
        console.log("type: signal");

        // --- Helper functions ---
        window.dxc = function(t,e,n){
            var a = CryptoJS.enc.Base64.parse(n),
                i = CryptoJS.enc.Base64.parse(e);
            return CryptoJS.AES.decrypt(t,i,{
                iv:a,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8)
        };

        window.adj = function(b,d,u){
            let t="";
            if(b.length>0) t='<span style="color:#e07a5f;">'+b+"</span>";
            t+="("+d+"MHz";
            if(u) t+="/"+u+"MHz";
            t+=")";
            return t;
        };

        function getColor(metric, val){
            switch(metric){
                case "rsrp":
                case "nr5rsrp":
                    if(val >= -80) return "#4CAF50";       // excellent
                    if(val >= -90) return "#8BC34A";       // good
                    if(val >= -100) return "#FFEB3B";      // fair
                    if(val >= -110) return "#FF9800";      // poor
                    return "#F44336";                      // very poor
                case "rsrq":
                case "nr5rsrq":
                    if(val >= -10) return "#4CAF50";
                    if(val >= -15) return "#8BC34A";
                    if(val >= -20) return "#FFEB3B";
                    return "#FF9800";
                case "sinr":
                case "nr5sinr":
                    if(val >= 20) return "#4CAF50";
                    if(val >= 13) return "#8BC34A";
                    if(val >= 0) return "#FFEB3B";
                    return "#F44336";
                default:
                    return "#2196F3";
            }
        }

        window.barGraph = function(p,val,min,max){
            if(val>max) val=max;
            if(val<min) val=min;
            let ap="a"+p;
            if(!window[ap]) window[ap]=[];
            window[ap].unshift(val);
            if(window[ap].length > window.boxcar) window[ap].pop();

            let html='<svg version="1.1" viewBox="0 0 '+window.gw+' '+window.gh+'" width="'+window.gw+'" height="'+window.gh+'" preserveAspectRatio="xMaxYMax slice" style="border:1px solid #e0e0e0;padding:1px;margin-top:-6px;width: '+window.gw+'px;background-color:#f8f9fa;">';
            for(let x=0;x<window[ap].length;x++){
                let pax=(window.gt+1)*(x+1);
                let pay=window.gh-1;
                let pby=window.gh-(window[ap][x]-min)/(max-min)*window.gh;
                let pc=(window[ap][x]-min)/(max-min)*100;
                let color = getColor(p, window[ap][x]);
                html+='<line x1="'+pax+'" y1="'+pay+'" x2="'+pax+'" y2="'+pby+'" stroke="'+color+'" stroke-width="'+window.gt+'" stroke-linecap="round"></line>';
            }
            html+="</svg>";
            $("#b"+p).html(html);
        };

        window.getStatus = function(){
            window.boxcar = window.gw / (window.gt + 1);
            $.ajax({
                type:"GET",
                url:"/cgi-bin/DAL?oid=cellwan_status",
                dataType:"json",
                success:function(s){
                    let signalData;
                    try{
                        let e=dxc(s.content,localStorage.AesKey,s.iv);
                        let v=JSON.parse(e);
                        signalData=v.Object[0];
                    } catch(e){
                        signalData=s.Object[0];
                    }

                    let vars=["NSA_PCI","NSA_RFCN","NSA_Band","NSA_RSSI","NSA_RSRP","NSA_RSRQ",
                              "NSA_SINR","INTF_PhyCell_ID","INTF_RFCN","INTF_Cell_ID","INTF_RSRP",
                              "INTF_RSRQ","INTF_Current_Band","INTF_SINR","INTF_RSSI",
                              "INTF_Network_In_Use","INTF_Current_Access_Technology","SCC_Info",
                              "INTF_Uplink_Bandwidth","INTF_Downlink_Bandwidth","NSA_PhyCellID",
                              "NSA_DL_BW"];

                    for(let i=0;i<vars.length;i++) window[vars[i]]=signalData[vars[i]];

                    window.barGraph("rsrp",window.INTF_RSRP,-130,-60);
                    window.barGraph("rsrq",window.INTF_RSRQ,-16,-3);
                    window.barGraph("sinr",window.INTF_SINR,0,24);
                    window.barGraph("nr5rsrp",window.NSA_RSRP,-130,-60);
                    window.barGraph("nr5rsrq",window.NSA_RSRQ,-16,-3);
                    window.barGraph("nr5sinr",window.NSA_SINR,0,24);

                    window.cell_id = window.INTF_Cell_ID;
                    window.rsrp = window.INTF_RSRP;
                    window.rsrq = window.INTF_RSRQ;
                    window.sinr = window.INTF_SINR;
                    window.rssi = window.INTF_RSSI;
                    window.nr5rsrp = window.NSA_RSRP;
                    window.nr5rsrq = window.NSA_RSRQ;
                    window.nr5sinr = window.NSA_SINR;
                    window.nr5rssi = window.NSA_RSSI;

                    $(".nr").toggle(typeof window.NSA_Band !== "undefined");

                    window.enbid = Math.trunc(window.cell_id/256);
                    window.Current_Band = window.adj(window.INTF_Current_Band,window.INTF_Downlink_Bandwidth,window.INTF_Uplink_Bandwidth);

                    let plmn = window.INTF_Network_In_Use.split("_")[3];

                    // With this Austria-friendly CellMapper link:
                    let mcc = 232; // Austria MCC
                    let mnc = 0;   // default, will try to detect from PLMN
                    switch (plmn) {
                        case '23201': mnc = '01'; break;
                        case '23202': mnc = '02'; break;
                        case '23203': mnc = '03'; break;
                    }

                    let link_lte = "https://www.cellmapper.net/map?MCC="+mcc+"&MNC="+mnc+"&cellid="+window.enbid;
                    $("#lteitaly").attr("href", link_lte);

                    if(window.INTF_Current_Access_Technology==="LTE-A")
                        $("#ca").parent().parent().css("border-color","#6a4c93");
                    else
                        $("#ca").parent().parent().css("border-color","#bbb");

                    window.ca_txt="";
                    for(let i=0;i<window.SCC_Info.length;i++)
                        window.ca_txt += window.adj(window.SCC_Info[i].Band,window.SCC_Info[i].DownlinkBandwidth,window.SCC_Info[i].UplinkBandwidth)+"+";

                    if(window.NSA_Band)
                        window.ca_txt += '<span style="padding:5px;border-radius:5px;font-size:1.2em;background-color:#ffad60;color:#000;font-weight:bold;">'+window.NSA_Band+"</span>("+window.NSA_DL_BW+"MHz)";

                    window.ca_txt = window.ca_txt.slice(0,-1);

                    let dervars = ["cell_id","sinr","rssi","rsrp","rsrq","nr5sinr","nr5rssi",
                                   "nr5rsrp","nr5rsrq","ca_txt","enbid",
                                   "INTF_Current_Access_Technology","Current_Band"];

                    for(let i=0;i<dervars.length;i++)
                        $("#"+dervars[i]).html(window[dervars[i]]);
                }
            });
        };

        window.i = function(){
            let ca_txt = window.INTF_Current_Band+"-PCI,EARFCN:"+window.INTF_PhyCell_ID+","+window.INTF_RFCN;
            if(window.SCC_Info!==""){
                for(let i=0;i<window.SCC_Info.length;i++)
                    ca_txt+="\n"+window.SCC_Info[i].Band+"-PCI,EARFCN:"+window.SCC_Info[i].PhysicalCellID+","+window.SCC_Info[i].RFCN;
            }

            let nsa_info="";
            if(typeof window.NSA_Band!=="undefined" &&
               typeof window.NSA_PhyCellID!=="undefined" &&
               typeof window.NSA_RFCN!=="undefined"){
                nsa_info="NR5G_"+window.NSA_Band.replace("NR5G_","");
                ca_txt+="\n"+nsa_info+"-PCI,EARFCN:"+window.NSA_PhyCellID+","+window.NSA_RFCN+"("+window.NSA_DL_BW+"MHz)";
            }

            $("#modal-content").html("<pre>"+ca_txt+"</pre>");
            $("#modal").show();
        };

        window.closeModal = function(){ $("#modal").hide(); };

        window.ftb = function(){
            $("body").prepend(`
<style>
.clear{clear:both}
li span{margin-left:5px}
#cell_id,#enbid,#nr5rsrp,#nr5rsrq,#nr5rssi,#nr5sinr,#rsrp,#rsrq,#rssi,#sinr{color:#e07a5f;font-weight:strong}
.f{float:left;border:1px solid #e0e0e0;border-radius:8px;padding:15px;line-height:2em;margin:5px;background-color:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.f ul{margin:0;padding:0}
.f ul li{display:inline;margin-right:5px;margin-left:5px}
#enbid{font-weight:700;text-decoration:underline}
.p{border-bottom:1px solid #e0e0e0;width:auto;height:20px}
.v{height:100%;border-right:1px solid #e0e0e0;padding-left:20px}
#modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:1000}
.modal-content{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.3);font-family:monospace;white-space:pre-wrap;word-break:break-word;max-width:80%;max-height:80%;overflow:auto}
.close-button{position:absolute;top:10px;right:10px;font-size:1.2em;cursor:pointer;background-color:#ddd;border:none;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center}
.action{background-color:#2980B9;padding:10px;border-radius:10px;color:#fff;font-weight:bolder;margin-right:5px;margin-left:5px;text-decoration:none}
.speedtest-button{background-color:#4CAF50}
.cellwanstatus-button{background-color:#B39DDB}
.reboot-button{background-color:#F05050}
</style>

<div style="display:block;overflow:auto">
    <div class="f">
        RSRP:<span id="rsrp"></span>dBm<div id="brsrp"></div>
        RSRQ:<span id="rsrq"></span>dB<div id="brsrq"></div>
        SINR:<span id="sinr"></span>dB<div id="bsinr"></div>
    </div>

    <div class="f nr">
        NR RSRP:<span id="nr5rsrp"></span>dBm<div id="bnr5rsrp"></div>
        NR RSRQ:<span id="nr5rsrq"></span>dB<div id="bnr5rsrq"></div>
        NR SINR:<span id="nr5sinr"></span>dB<div id="bnr5sinr"></div>
    </div>

    <div class="f">
        <ul><li id="INTF_Current_Access_Technology">Che la banda sia con te! Miononno&Riskio87 ♥</li></ul>
    </div>

    <div class="f">
        <ul>
            <li>ENB ID:<a id="lteitaly" target="lteitaly" href="#"><span id="enbid">#</span></a></li>
            <li>CELL ID:<span id="cell_id">#</span></li>
        </ul>
    </div>

    <div class="f">
        <ul>
            <li>MAIN:<span id="Current_Band"></span></li>
            <li id="ca">CA:<span id="ca_txt"></span>)</li>
        </ul>
    </div>

    <div class="f">
        <ul>
            <li><a class="action" href="#" onclick="i()">INFO</a></li>
            <li><a class="action cellwanstatus-button" target="_blank" href="/CellWanStatus">Cell INFO</a></li>
            <li><a class="action speedtest-button" target="_blank" href="https://www.speedtest.net/">SpeedTest</a></li>
            <li><a class="action reboot-button" href="/Reboot">Reboot</a></li>
        </ul>

        <div id="modal">
            <div class="modal-content">
                <span class="close-button" onclick="closeModal()">×</span>
                <div id="modal-content"></div>
            </div>
        </div>
    </div>
</div>
            `);
        };

        // --- Initialize UI ---
        window.ftb();
        window.setInterval(window.getStatus,1500);
    });
})();
