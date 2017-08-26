// https://github.com/mojaie/kiwiii-client Version 0.7.0. Copyright 2017 Seiji Matsuoka.
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("d3"),require("Dexie")):"function"==typeof define&&define.amd?define(["d3","Dexie"],t):t(e.d3,e.Dexie)}(this,function(e,t){"use strict";function r(e){return D[e]}function n(e){return I.getResources().then(t=>t.filter(t=>e.includes(t.domain)))}function s(){const e=r("urlQuery");return e.hasOwnProperty("id")?I.getItemById(e.id):Promise.resolve()}function o(e,t,r){return I.updateItem(e,e=>{e[t]=r})}function a(){"serviceWorker"in navigator&&!f?navigator.serviceWorker.register("sw.js").then(e=>{console.info("ServiceWorker registration successful with scope: ",e.scope)}).catch(e=>{console.info("ServiceWorker registration failed: ",e)}):f?console.info("Off-line mode is disabled for debugging"):console.info("Off-line mode is not supported");const e=O.templates().then(e=>{A.setGlobalConfig("templates",e.templates)}),t=O.status().then(e=>{A.setGlobalConfig("server",e)}),r=A.fetcherInstances().map(e=>e.getResources()).extendAsync().then(e=>{const t=e.map((e,t)=>(e.idx=t,e));return A.setResources(t)});return Promise.all([e,t,r])}function i(e,t){const r=parseFloat(e),n=parseFloat(t);return isNaN(r)||isNaN(n)?String(t).localeCompare(String(e)):n-r}function l(e,t){return String(t).localeCompare(String(e))}function c(e,t,r){const n=e.select("thead tr").selectAll("th").data(),s=e.select("tbody").selectAll("tr").data(t,r);s.exit().remove();const o=s.enter().append("tr");o.selectAll("td").data(e=>n.map(t=>e[t.key])).enter().append("td"),o.merge(s).selectAll("td").classed("align-middle",!0).html((e,t)=>void 0===e?"":"plot"===n[t].valueType?"[plot]":"image"===n[t].valueType?"[image]":n[t].hasOwnProperty("digit")&&"raw"!==n[t].digit?T.formatNum(e,n[t].digit):e)}function u(t,r){r.records.forEach(e=>{e.action=`<a role="button" class="btn btn-secondary btn-sm" href="${r.app}?id=${e.id}" target="_blank">Open</a>`,y.fetchable(r)?e.action+=`<button type="button" class="btn btn-warning btn-sm" disabled>Running</button>`:e.action+=`<button type="button" class="btn btn-warning btn-sm delete-item" data-toggle="modal" data-target="#confirm-dialog" data-tblid="${e.id}" data-tblname="${e.name}">Delete</button>`}),e.select(t).call($.createTable,r).call($.updateTableRecords,r.records,e=>e.id),e.selectAll("tr button.delete-item").on("click",function(){const t=e.select(this).attr("data-tblid"),r=e.select(this).attr("data-tblname");e.select("#confirm-message").text(`Are you sure you want to delete ${r} ?`),e.select("#confirm-submit").on("click",()=>A.deleteTable(t).then(h))})}function d(e){const t={app:"datatable.html",columns:[{key:"name"},{key:"responseDate"},{key:"status"},{key:"records"},{key:"action"}]};t.records=e.map(e=>(e.hasOwnProperty("status")||(e.status="Completed"),{id:e.id,name:e.name,responseDate:e.responseDate,status:e.status,records:e.records.length})),u("#local-tables",t)}function m(e){const t={app:"graph.html",columns:[{key:"name"},{key:"responseDate"},{key:"nodeTableId"},{key:"status"},{key:"edges"},{key:"action"}]};t.records=e.map(e=>(e.hasOwnProperty("status")||(e.status="Completed"),{id:e.id,name:e.name,responseDate:e.responseDate,nodeTableId:e.nodeTableId,status:e.status,edges:e.records.length})),u("#local-graphs",t)}function p(t){e.select("#server-calc").call($.createTable,t.calc).call($.updateTableRecords,t.calc.records,e=>e._index);const r={columns:[{key:"key"},{key:"value"}],records:[]};Object.entries(t).filter(e=>"calc"!==e[0]).forEach(e=>r.records.push({key:e[0],value:e[1]})),e.select("#server-status").call($.createTable,r).call($.updateTableRecords,r.records,e=>e._index)}function h(){return A.getGlobalConfig("onLine")&&p(A.getGlobalConfig("server")),Promise.all([A.getTablesByFormat("datatable").then(d),A.getTablesByFormat("connection").then(m)])}const f=!1;e=e&&e.hasOwnProperty("default")?e.default:e;var y={fetchable:function(e){return["In progress","Queued","Aborting"].includes(e.status)},abortRequestable:function(e){return["In progress","Queued"].includes(e.status)},conclike:function(e){return e.hasOwnProperty("valueType")&&["AC50","IC50","ED50"].includes(e.valueType)},dataSourceId:function(e,t,r){return[e,t,r].map(e=>e.capitalize()).join("")}};const g={app:"key",items:"id, format, responseDate",resources:"idx, id"};let b=new(t=t&&t.hasOwnProperty("default")?t.default:t)("Store");b.version(1).stores(g);var I={getAppSetting:function(e){return b.app.where("key").equals(e).first().then(e=>{if(void 0!==e)return e.value})},putAppSetting:function(e,t){return b.app.put({key:e,value:t})},getResources:function(){return b.resources.orderBy("idx").toArray()},putResources:function(e){return b.resources.bulkPut(e)},getAllItems:function(){return b.items.orderBy("responseDate").reverse().toArray()},getItemsByFormat:function(e){return b.items.where("format").equals(e).reverse().sortBy("responseDate")},getItemById:function(e){return b.items.where("id").equals(e).first()},updateItem:function(e,t){return b.items.where("id").equals(e).modify(t)},deleteItem:function(e){return b.items.where("id").equals(e).delete()},putItem:function(e){return b.items.put(e)},reset:function(){return b.delete().then(()=>{(b=new t("Store")).version(1).stores(g)})}};class w{constructor(){this.baseURL="",this.available=!1}xhrRequest(e,t=null,r={}){return new Promise((n,s)=>{const o=new XMLHttpRequest;o.open("method"in r?r.method:"POST",e),o.responseType="responseType"in r?r.responseType:"json",o.withCredentials="withCredentials"in r&&r.withCredentials,o.onload=(()=>{200!==o.status?s(o):n(o.response)}),o.send(t)})}now(){return(new Date).toString()}getResources(){}formatResult(e,t){return t.lastUpdated=this.now(),t}getRecords(){}getRecordsByCompound(){}getMapping(){}getGraphEdges(){}}class v extends w{constructor(){super(),this.baseURL="./",this.domain="activity",this.entities=[]}serializedRequest(e,t={}){const r=new FormData;return r.set("query",JSON.stringify(t)),fetch(`${this.baseURL}${e}`,{method:"post",body:r,credentials:"include"})}request(e,t={}){const r=new FormData;return new Map(Object.entries(t)).forEach((e,t)=>{Array.isArray(e)?e.forEach(e=>r.append(t,e)):r.set(t,e)}),fetch(`${this.baseURL}${e}`,{method:"post",body:r,credentials:"include"})}getResources(){return this.request("schema",{domain:this.domain}).then(e=>e.json()).then(e=>(e.resources.forEach(e=>{e.domain=this.domain,e.columns.forEach(e=>{e.hasOwnProperty("name")||(e.name=e.key),e.hasOwnProperty("dataColumn")||(e.dataColumn=e.key),e.hasOwnProperty("method")||(e.method="sql"),e.visible=!0}),this.entities.push(e.entity)}),this.available=!0,e.resources))}getRecords(e){return this.serializedRequest("sql",e).then(e=>e.json()).then(e=>(e.domain=this.domain,e))}getRecordsByCompound(e){const t={method:"sql",targets:this.entities,key:"ID",values:[e],operator:"eq"};return this.getRecords(t)}getMapping(e,t){const r={method:"sql",targets:[t.entity],key:"ID",values:e,operator:"fm"};return this.serializedRequest("sql",r).then(e=>e.json()).then(e=>{const n={};return e.records.filter(e=>e.hasOwnProperty(t.dataColumn)).forEach(e=>{n[e.ID]=e[t.dataColumn]}),{key:r.key,column:t,mapping:n,lastUpdated:this.now()}})}status(){return this.request("server").then(e=>e.json())}templates(){return this.request("templates").then(e=>e.json())}strprev(e){return this.serializedRequest("strprev",e).then(e=>e.text())}exportExcel(e){return this.request("xlsx",e).then(e=>e.blob())}exportSDFile(e){return this.request("exportsdf",e).then(e=>e.text())}reportPreview(e){return this.request("reportprev",e).then(e=>e.json())}report(e){return this.request("report",e).then(e=>e.blob())}}class R extends v{constructor(){super(),this.domain="chemical",this.hiddenColumns=["_mw","_mw_wo_sw","_formula","_logp","_nonH"]}formatResult(e,t){return 0===e.length?(t.columns.forEach(e=>{e.visible=!this.hiddenColumns.includes(e.key)}),t):(Array.prototype.push.apply(t.columns,e),t.hasOwnProperty("extraColumns")&&(Array.prototype.push.apply(t.columns,t.extraColumns),delete t.extraColumns),t.columns.forEach(e=>{e.hasOwnProperty("name")||(e.name=e.key),e.key===t.query.key?e.visible=!0:e.visible=!this.hiddenColumns.includes(e.key)}),t.lastUpdated=this.now(),t)}getResources(){return this.request("schema",{domain:this.domain}).then(e=>e.json()).then(e=>(e.resources.forEach(e=>{e.domain=this.domain,e.columns.forEach(e=>{e.hasOwnProperty("name")||(e.name=e.key),e.hasOwnProperty("dataColumn")||(e.dataColumn=e.key),e.hasOwnProperty("method")||(e.method="chemsql"),e.visible=!0})}),this.available=!0,e.resources))}getRecords(e){let t;return t=e.hasOwnProperty("command")?"rows":e.hasOwnProperty("nodeTableId")?"graph":["chemsql","sql"].includes(e.method)?"sql":"compute",this.serializedRequest(t,e).then(e=>e.json()).then(e=>(e.domain=this.domain,e))}importSDF(e){return this.request("sdf",e).then(e=>e.json()).then(e=>{e.domain=this.domain,e.columns.forEach(e=>{e.visible=!this.hiddenColumns.includes(e.key)});const t=new Date;return e.lastUpdated=t.toString(),e})}}class C extends w{constructor(){super(),this.resourceFile="screener_fitting.yaml",this.domain=null,this.baseURL=null}getResources(){const e=new FormData;return e.set("filename",this.resourceFile),fetch("source",{method:"post",body:e,credentials:"include"}).then(e=>e.json()).then(e=>{if(!e.hasOwnProperty("enabled")||!1!==e.enabled)return this.available=!0,this.domain=e.domain,this.baseURL=e.url,e.resources.map(t=>(t.domain=e.domain,t.entity=`${t.qcsRefId}:${t.layerIndex}`,delete t.qcsRefId,delete t.layerIndex,t.columns.forEach(e=>{e.hasOwnProperty("name")||(e.name=e.key),e.hasOwnProperty("dataColumn")||(e.dataColumn=e.key),e.visible=!0}),t))})}request(e){return fetch(`${this.baseURL}${e}`,{method:"GET",credentials:"include"}).then(e=>e.json())}requestRecords(e){return this.request(e).then(e=>({records:e.compounds.map(e=>({ID:e.compoundId,qcsRefId:e.qcsRefId,layerIndex:e.layerIndex,drcPlot:e.fitting.drcPlot,AC50:e.fitting.linearAC50,hill:Math.round(100*e.fitting.hillCoefficient)/100}))}))}getRecords(e){const t=`/compounds?qcsRefIds=${e.qcsRefIds.join("%2C")}&layerIndices=${e.layerIndex-1}&fields=compoundId%2Cfitting.drcPlot%2Cfitting.linearAC50%2Cfitting.hillCoefficient`;return this.requestRecords(t)}getRecordsByCompound(e){const t=`/compounds?q=compoundId%3A${e}&fields=compoundId%2CqcsRefId%2ClayerIndex%2Cfitting.drcPlot%2Cfitting.linearAC50%2Cfitting.hillCoefficient`;return this.requestRecords(t)}getMapping(e,t){const r=t.entity.split(":"),n={qcsRefId:r[0],layerIndex:parseInt(r[1])};return this.getRecords(n).then(r=>{const n={};return r.records.filter(t=>e.includes(t.ID)).forEach(e=>{n[e.ID]=e[t.dataColumn]}),{key:"ID",column:t,mapping:n,lastUpdated:this.now()}})}getDrcPlot(e,t,r=-20,n=120){const s=`/${t}?width=180&height=180&title=compoundId&activityRangeMin=${r}&activityRangeMax=${n}`;return this.request(s)}getQcsInfo(e){const t=`/qcSessions?q=${e.map(e=>`qcsRefId:${e}`).join(" OR ")}`;return this.request(t).then(e=>e.qcSessions)}}class q extends C{constructor(){super(),this.resourceFile="screener_rawvalue.yaml"}getResources(){const e=new FormData;return e.set("filename",this.resourceFile),fetch("source",{method:"post",body:e,credentials:"include"}).then(e=>e.json()).then(e=>{if(!e.hasOwnProperty("enabled")||!1!==e.enabled)return this.available=!0,this.domain=e.domain,this.baseURL=e.url,e.resources.map(t=>(t.domain=e.domain,t.entity=`${t.qcsRefId}:${t.layerIndex}`,delete t.qcsRefId,delete t.layerIndex,t.columns.forEach(e=>{e.key="rawValue",e.hasOwnProperty("name")||(e.name=e.key),e.hasOwnProperty("dataColumn")||(e.dataColumn=e.key),e.visible=!0}),t))})}requestRecords(e,t){return this.request(e).then(e=>({records:e.plates.filter(e=>e.wells.hasOwnProperty("compoundIds")).map(e=>e.wells.compoundIds.map((t,r)=>({ID:t,qcsRefId:e.qcsRefId,layerIndex:e.layerIndex,rawValue:e.wells.rawValues[r]})).filter(t)).extend()}))}getRecords(e){const t=`/plates?qcsRefIds=${e.qcsRefIds.join("%2C")}&layerIndices=${e.layerIndex-1}&limit=200&fields=wells.rawValues%2Cwells.compoundIds`;return this.requestRecords(t,e=>null!==e.ID)}getRecordsByCompound(e){const t=`/plates?q=wells.compoundIds%3A${e}&fields=wells.rawValues%2Cwells.compoundIds`;return this.requestRecords(t,t=>t.ID===e)}}class x extends C{constructor(){super(),this.resourceFile="screener_fitting_stub.yaml"}fittingStub(e){if("string"!=typeof e.qcsRefId)throw`${e.qcsRefId} is not a string`;if("number"!=typeof e.layerIndex)throw`${e.layerIndex} is not a number`;return[{ID:"DB00189",drcPlot:"dummy1",AC50:21e-7,hill:1.1,source:"target1_validation"},{ID:"DB00193",drcPlot:"dummy2",AC50:42e-7,hill:null,source:"target1_validation"},{ID:"DB00203",drcPlot:"dummy3",AC50:1e-5,hill:.9,source:"target1_validation"},{ID:"DB00865",drcPlot:"dummy4",AC50:8.8e-8,hill:2.1,source:"target1_validation"},{ID:"DB01143",drcPlot:"dummy5",AC50:"n.d.",hill:null,source:"target1_validation"},{ID:"DB01240",drcPlot:"dummy6",AC50:null,hill:null,source:"target1_validation"}]}getRecords(e){return Promise.resolve({records:this.fittingStub(e)})}getRecordsByCompound(e){const t=this.fittingStub({qcsRefId:"QCS-YYYY",layerIndex:1}).filter(t=>t.ID===e);return Promise.resolve({records:t})}qcsInfoStub(e){if(!Array.isArray(e))throw`${e} is not a string`;const t=[{layerIndex:0,name:"Activity%"},{layerIndex:1,name:"Background%"},{layerIndex:2,name:"Correction"}];return[{qcsRefId:"QCS-XXX0",name:"hoge",layers:t},{qcsRefId:"QCS-XXX1",name:"fuga",layers:t},{qcsRefId:"QCS-XXX2",name:"piyo",layers:t}]}getQcsInfo(e){return Promise.resolve(this.qcsInfoStub(e))}}class k extends q{constructor(){super(),this.resourceFile="screener_rawvalue_stub.yaml"}rawValueStub(e){if("string"!=typeof e.qcsRefId)throw`${e.qcsRefId} is not a string`;if("number"!=typeof e.layerIndex)throw`${e.layerIndex} is not a number`;return[{ID:"DB00189",rawValue:12.7,source:"target1_screen"},{ID:"DB00193",rawValue:43.6,source:"target1_screen"},{ID:"DB00203",rawValue:102.6,source:"target1_screen"},{ID:"DB00865",rawValue:-.6,source:"target1_screen"},{ID:"DB01143",rawValue:50,source:"target1_screen"},{ID:"DB01240",rawValue:null,source:"target1_screen"}]}getRecords(e){return Promise.resolve({records:this.rawValueStub(e)})}getRecordsByCompound(e){const t=this.rawValueStub({qcsRefId:"QCS-XXXX",layerIndex:1}).filter(t=>t.ID===e);return Promise.resolve({records:t})}}const D={onLine:!0,server:{},templates:{},urlQuery:{}};window.location.search.substring(1).split("&").map(e=>e.split("=")).forEach(e=>{D.urlQuery[e[0]]=e[1]});const P=new Map(Object.entries({chemical:new R,activity:new v,screenerrawvalue:new q,screenerfitting:new C,screenerrawvaluestub:new k,screenerfittingstub:new x}));var A={getGlobalConfig:r,setGlobalConfig:function(e,t){D[e]=t},localChemInstance:function(){return P.get("chemical")},getFetcher:function(e){return P.get(e)},fetcherInstances:function(){return Array.from(P.values())},dataFetcherInstances:function(){const e=[];return P.forEach((t,r)=>{"chemical"!==r&&e.push(t)}),e},dataFetcherDomains:function(){const e=[];return P.forEach((t,r)=>{"chemical"!==r&&e.push(r)}),e},getResources:n,setResources:function(e){return I.putResources(e)},getResourceColumns:function(e){return n(e).then(e=>e.map(e=>e.columns.map(t=>(t.domain=e.domain,t.key=y.dataSourceId(e.domain,e.id,t.key),t.entity=e.entity,t.hasOwnProperty("tags")||(t.tags=e.tags),t))).extend())},getDataSourceColumns:function(e,t){return I.getResources([e]).then(e=>t.map(t=>e.find(e=>e.id===t).columns).extend())},getAllTables:function(){return I.getAllItems()},getTablesByFormat:function(e){return I.getItemsByFormat(e)},getTable:function(e){return I.getItemById(e)},getRecords:function(e){return I.getItemById(e).then(e=>e.records)},getCurrentTable:s,getCurrentRecords:function(){return s().then(e=>e.records)},setColumnsToShow:function(e){return I.updateItem(r("urlQuery").id,t=>{t.columns.forEach((t,r)=>{t.visible=e.visibles.includes(t.key),t.sort=e.sorts[r],t.digit=e.digits[r]})})},joinColumn:function(e,t=D.urlQuery.id){const r=e.hasOwnProperty("column")?e.column:e.columns;return I.updateItem(t,t=>{t.records.filter(t=>e.mapping.hasOwnProperty(t[e.key])).forEach(t=>{e.hasOwnProperty("column")?t[e.column.key]=e.mapping[t[e.key]]:e.columns.forEach((r,n)=>{t[r.key]=e.mapping[t[e.key]][n]})}),t.columns=t.columns.concat(r).unique("key"),t.lastUpdated=e.lastUpdated})},updateTableAttribute:o,insertTable:function(e){return I.putItem(e)},updateTable:function(e){return void 0===e?Promise.resolve():"Failure"===e.status?o(e.id,"status","Failure"):I.updateItem(e.id,t=>{const r={responseDate:e.responseDate,records:e.records,columns:e.columns,recordCount:e.recordCount,searchDoneCount:e.searchDoneCount,execTime:e.execTime,progress:e.progress,status:e.status};e.hasOwnProperty("lastUpdated")&&(r.lastUpdated=e.lastUpdated),Object.assign(t,r)})},deleteTable:function(e){return I.deleteItem(e)},reset:function(){return I.reset()}};const O=A.localChemInstance();var S={loader:function(){return"file:"===document.location.protocol?(console.info("Off-line mode (local file)"),A.setGlobalConfig("onLine",!1),Promise.resolve()):"onLine"in navigator&&!navigator.onLine?(console.info("Off-line mode (no internet connection)"),A.setGlobalConfig("onLine",!1),Promise.resolve()):fetch(`${O.baseURL}favicon.ico`).then(()=>(A.setGlobalConfig("onLine",!0),a())).catch(()=>(console.info("Off-line mode (server not responding)"),A.setGlobalConfig("onLine",!1),Promise.resolve()))}},T={formatNum:function(t,r){const n={scientific:".3e",si:".3s",rounded:".3r"};return"raw"===r?t:void 0===t||null===t||Number.isNaN(t)?"":t==parseFloat(t)?e.format(n[r])(t):t},partialMatch:function(e,t){return void 0!==t&&null!==t&&""!==t&&-1!==t.toString().toUpperCase().indexOf(e.toString().toUpperCase())},numericAsc:i,numericDesc:function(e,t){return i(t,e)},textAsc:l,textDesc:function(e,t){return l(t,e)}},$={selectOptions:function(e,t,r,n){const s=e.selectAll("option").data(t,r);s.exit().remove(),s.enter().append("option").merge(s).attr("value",r).text(n)},checkboxList:function(e,t,r,n,s){const o=e.selectAll("li").data(t,n);o.exit().remove();const a=o.enter().append("li").attr("class","form-check").append("label");a.append("input"),a.append("span");const i=a.merge(o.select("label")).attr("class","form-check-label");i.select("input").attr("type","checkbox").attr("class","form-check-input").attr("name",r).attr("value",n),i.select("span").text(s)},createTable:function(e,t){e.select("thead").size()||e.append("thead").append("tr"),e.select("tbody").size()||e.append("tbody");const r=t.columns.filter(e=>!e.hasOwnProperty("visible")||!1!==e.visible),n=e.select("thead tr").selectAll("th").data(r,e=>e.key);n.exit().remove(),n.enter().append("th").merge(n).text(e=>e.hasOwnProperty("name")?e.name:e.key)},updateTableRecords:c,appendTableRows:function(e,t,r){const n=e.select("tbody").selectAll("tr").data();Array.prototype.push.apply(n,t),c(e,n,r)},addSort:function(t){t.select("thead tr").selectAll("th").filter(e=>"none"!==e.sort).append("span").append("a").attr("id",e=>`sort-${e.key}`).text("^v").style("display","inline-block").style("width","30px").style("text-align","center").on("click",r=>{const n="v"===e.select(`#sort-${r.key}`).text(),s=!r.hasOwnProperty("sort")||"numeric"===r.sort,o=n?s?T.numericAsc:T.textAsc:s?T.numericDesc:T.textDesc;t.select("tbody").selectAll("tr").sort((e,t)=>o(e[r.key],t[r.key])),e.select(`#sort-${r.key}`).text(n?"^":"v")})},formatNumbers:function(e){e.select("thead tr").selectAll("th").each((t,r)=>{t.hasOwnProperty("digit")&&"raw"!==t.digit&&e.select("tbody").selectAll("tr").selectAll("td").filter((e,t)=>t===r).text(e=>T.formatNum(e,t.digit))})}};const B=A.localChemInstance();e.select("#refresh-all").on("click",()=>A.getAllTables().then(e=>{const t=e.map(e=>{if(!y.fetchable(e))return Promise.resolve();const t={id:e.id,command:"fetch"};return B.getRecords(t).then(A.updateTable)});return Promise.all(t)}).then(h)),e.select("#reset-local").on("click",()=>{e.select("#confirm-message").text("Are you sure you want to delete all local tables and reset the datastore ?"),e.select("#confirm-submit").on("click",()=>A.reset().then(h))}),S.loader().then(h)});
//# sourceMappingURL=kwcontrol.js.map
