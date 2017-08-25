// https://github.com/mojaie/kiwiii-client Version 0.7.0. Copyright 2017 Seiji Matsuoka.
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("d3"),require("pako"),require("Dexie")):"function"==typeof define&&define.amd?define(["d3","pako","Dexie"],t):t(e.d3,e.pako,e.Dexie)}(this,function(e,t,n){"use strict";function r(e,n){const r=n?t.inflate(e,{to:"string"}):e;return JSON.parse(r)}function s(e){const t=e.endsWith(".gz");return fetch(e).then(e=>t?e.arrayBuffer():e.json()).then(e=>r(e,t))}function a(e){return w[e]}function l(e,t,n,r){A.nodes(e).force("link").links(t),A.on("tick",n).on("end",r)}function o(){e.select("#graph-contents").selectAll(".node").attr("transform",e=>`translate(${e.x}, ${e.y})`);const t=A.alpha(),n=t<=A.alphaMin();e.select("#temperature").classed("progress-success",n).classed("progress-warning",!n).attr("value",n?1:1-t).text(n?1:1-t)}function c(){e.select("#graph-contents").selectAll(".link").attr("transform",e=>`translate(${e.source.x}, ${e.source.y})`).attr("visibility","visible"),e.select("#graph-contents").selectAll(".edge-line").attr("x1",0).attr("y1",0).attr("x2",e=>e.target.x-e.source.x).attr("y2",e=>e.target.y-e.source.y),e.select("#graph-contents").selectAll(".edge-label").attr("x",e=>(e.target.x-e.source.x)/2).attr("y",e=>(e.target.y-e.source.y)/2)}function i(e){let t=z.find(t=>t.name===e.scale).func,n=e.domain;if(3===e.range.length){const t=(parseFloat(e.domain[0])+parseFloat(e.domain[1]))/2;n=[e.domain[0],t,e.domain[1]]}return"ordinal"!==e.scale&&(t=t.domain(n)),t=t.range(e.range),["linear","log"].includes(e.scale)&&(t=t.clamp(!0)),n=>{if(""===n||void 0===n||null===n)return e.unknown;if("ordinal"!==e.scale&&parseFloat(n)!=n)return e.unknown;if("log"===e.scale&&n<=0)return e.unknown;const r=t(n);return void 0===r?e.unknown:r}}function d(t,n){const r={scientific:".3e",si:".3s",rounded:".3r"};return"raw"===n?t:void 0===t||null===t||Number.isNaN(t)?"":t==parseFloat(t)?e.format(r[n])(t):t}function u(t){e.selectAll(".node").select(".node-symbol").style("fill",e=>i(t.scale)(e[t.column.key]))}function f(t){e.selectAll(".node").select(".node-symbol").attr("r",e=>i(t.scale)(e[t.column.key]))}function y(t){e.selectAll(".node").select(".node-label").text(e=>e.hasOwnProperty(t.text)?t.column.hasOwnProperty("digit")&&"raw"!==t.column.digit?d(e[t.text],t.column.digit):e[t.text]:"").attr("font-size",t.size).attr("visibility",t.visible?"inherit":"hidden").style("fill",e=>i(t.scale)(e[t.column.key]))}function g(t){e.selectAll(".node").select(".node-struct").attr("visibility",t.structure.visible?"inherit":"hidden").each((t,n,r)=>{const s=e.select(r[n]).select("svg").attr("width"),a=e.select(r[n]).select("svg").attr("height");e.select(r[n]).attr("transform",`translate(${-s/2},${-a/2})`)})}function p(e){f(e.nodeSize),u(e.nodeColor),y(e.nodeLabel),g(e.nodeContent)}function h(e,t){const n=e.selectAll(".node").data(t,e=>e.key);n.exit().remove();const r=n.enter().append("g").attr("class","node");r.append("circle").attr("class","node-symbol"),r.append("g").attr("class","node-struct"),r.append("text").attr("class","node-label");const s=r.merge(n);s.select(".node-symbol").attr("r",20).style("fill","#6c6"),s.select(".node-struct").attr("visibility","hidden").html(e=>e._structure),s.select(".node-label").attr("visibility","hidden").attr("x",0).attr("y",30).attr("font-size",16).attr("text-anchor","middle")}function m(e,t){const n=e.selectAll(".link").data(t,e=>`${e.source}_${e.target}`);n.exit().remove();const r=n.enter().append("g").attr("class","link");r.append("line").attr("class","edge-line"),r.append("text").attr("class","edge-label");const s=r.merge(n);s.select(".edge-line").style("stroke","#999").style("stroke-opacity",.6),s.select(".edge-label").attr("font-size",16).attr("text-anchor","middle").attr("visibility","hidden").text(e=>e.weight)}function x(){A.alpha(0).stop(),e.selectAll(".node").each(e=>{e.fx=e.x,e.fy=e.y}),o(),c(),e.select("#stick-nodes").property("checked",!0),e.select("#graph-contents").selectAll(".link").attr("visibility","visible"),e.select("#graph-contents").selectAll(".node").call(P)}function v(t){if(t.hasOwnProperty("fieldTransform")){const n=t.fieldTransform,r=e.zoomIdentity.translate(n.x,n.y).scale(n.k);e.select("#graph-contents").attr("transform",r),e.select("#graph-field").call($.transform,r)}t.hasOwnProperty("nodePositions")&&e.selectAll(".node").each((e,n)=>{e.x=t.nodePositions[n].x,e.y=t.nodePositions[n].y}),p(t)}function b(t){t.nodes.records.forEach(e=>{delete e._mol});const n=t.edges.records.filter(e=>e.weight>=t.edges.networkThreshold);m(e.select("#graph-contents"),n),h(e.select("#graph-contents"),t.nodes.records),l(t.nodes.records,n,o,c),v(t.edges.snapshot),x(),e.select("#graph-contents").style("opacity",1e-6).transition().duration(1e3).style("opacity",1)}e=e&&e.hasOwnProperty("default")?e.default:e,t=t&&t.hasOwnProperty("default")?t.default:t;const k={app:"key",items:"id, format, responseDate",resources:"idx, id"};new(n=n&&n.hasOwnProperty("default")?n.default:n)("Store").version(1).stores(k);const w={onLine:!0,server:{},templates:{},urlQuery:{}};window.location.search.substring(1).split("&").map(e=>e.split("=")).forEach(e=>{w.urlQuery[e[0]]=e[1]});const A=e.forceSimulation().force("link",e.forceLink().id(e=>e._index).distance(60).strength(1)).force("charge",e.forceManyBody().strength(-600).distanceMin(15).distanceMax(720)).force("collide",e.forceCollide().radius(90)).force("center",e.forceCenter(600,600)).force("x",e.forceX().strength(.002)).force("y",e.forceY().strength(.002)).stop(),z=(e.schemeSet1.concat(e.schemeSet3,e.schemePastel2,e.schemeSet2),[{name:"linear",func:e.scaleLinear()},{name:"log",func:e.scaleLog()},{name:"quantize",func:e.scaleQuantize()},{name:"ordinal",func:e.scaleOrdinal()}]),$=(e.scaleLinear(),e.scaleLog(),e.scaleQuantize(),e.zoom().on("zoom",()=>{e.select("#graph-contents").attr("transform",e.event.transform)})),P=(e.drag().on("start",()=>{e.select("#graph-contents").selectAll(".link").attr("visibility","hidden"),e.event.active||A.alphaTarget(.1).restart()}).on("drag",t=>{t.fx=e.event.x,t.fy=e.event.y}).on("end",t=>{e.event.active||A.alphaTarget(0),t.fx=null,t.fy=null}),e.drag().on("drag",function(t){e.select(this).attr("transform",()=>`translate(${e.event.x}, ${e.event.y})`),t.x=e.event.x,t.y=e.event.y;const n=e.select("#graph-contents").selectAll(".link").filter(e=>[e.source.index,e.target.index].includes(this.__data__.index));n.attr("transform",e=>`translate(${e.source.x}, ${e.source.y})`).attr("visibility","visible"),n.select(".edge-line").attr("x1",0).attr("y1",0).attr("x2",e=>e.target.x-e.source.x).attr("y2",e=>e.target.y-e.source.y),n.select(".edge-label").attr("x",e=>(e.target.x-e.source.x)/2).attr("y",e=>(e.target.y-e.source.y)/2)}).on("end",()=>{c()}));e.select("#graph-field").attr("viewBox",`0 0 800 600`).call($),s(a("urlQuery").location).then(b)});
//# sourceMappingURL=graphview.js.map
