(function(root){'use strict';const A=root.Arkham,prior=A.runtimeCode,map={'02157':'01695','02158':'01694','02194':'01693','02261':'01684','02308':'01691'};A.runtimeCode=id=>map[id]||(prior?prior(id):id);A.Content.register({cards:Object.keys(map)});
})(typeof window==='undefined'?globalThis:window);
