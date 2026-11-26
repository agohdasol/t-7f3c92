/* These four exact reprints use the tested revised-core implementations. */
(function(root){'use strict';const A=root.Arkham,previous=A.runtimeCode,map={'03031':'01687','03230':'01683','03234':'01688','03236':'01690'};
A.runtimeCode=id=>map[id]||(previous?previous(id):id);
A.Content.register({cards:Object.keys(map)});
})(typeof window==='undefined'?globalThis:window);
