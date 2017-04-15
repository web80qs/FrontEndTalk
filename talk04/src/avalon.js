import {avalon} from './seed/core' //common
import './seed/lang.compact' //common


// import './filters/index'
import './dom/compact' //avalon.scan

// import './vtree/fromString' //??? 好像内部已经引用
// import './vtree/fromDOM' //??? 好像内部已经引用

import './vdom/compact'  //avalon.scan
import './vmodel/compact'  //avalon.define
import './directives/compact'  //avalon.scan

import './renders/domRender'  //avalon.scan

// import './effect/index'
// import './component/index'
export default avalon