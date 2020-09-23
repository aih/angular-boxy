(function() {
  /* global angular */
  var boxy = angular.module("boxy", ['ng']);
  
  var hgutterNodeHandle = document.createElement('div');
  hgutterNodeHandle.className = 'bxHgutterHandle';
  var hgutterNode = document.createElement('div');
  hgutterNode.className = 'bxHgutter';
  hgutterNode.appendChild(hgutterNodeHandle);

  var vgutterNodeHandle = document.createElement('div');
  vgutterNodeHandle.className = 'bxVgutterHandle';
  var vgutterNode = document.createElement('div');
  vgutterNode.className = 'bxVgutter';
  vgutterNode.appendChild(vgutterNodeHandle);
  boxy.directive('bxResize', function($document) {

    return function($scope, $element, $attrs) {
        var MAXRESIZE = 99;
        var splitElement = {};
        var $parent = $element.parent();

       if ($attrs.bxInitWidth){
        $element.css('width', $attrs.bxInitWidth);
       }
       if ($attrs.bxInitHeight){
        $element.css('height', $attrs.bxInitHeight);
       }
        if (($attrs.bxResize === 'horizontal') || $attrs.bxResize === 'both') {
            // Create horizontal gutter
            var hgutterCopy = angular.copy(hgutterNode);
            var $hgutter = angular.element(hgutterCopy);
            if($attrs.bxResizeBorder==='left'){
                $hgutter.css('left', 0);
            }else if($attrs.bxResizeBorder==='right'){
                $hgutter.css('right', 0);
            }
            $element[0].insertBefore(hgutterCopy,$element[0].firstChild);

            $hgutter.on('mousedown', function(event) {
                event.preventDefault();
                event.stopPropagation();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
        }
        if (($attrs.bxResize === 'vertical') || $attrs.bxResize === 'both') {
                // Create vertical gutter
                var vgutterCopy = angular.copy(vgutterNode);
                var $vgutter = angular.element(vgutterCopy);
                if($attrs.bxResizeBorder==='top'){
                    $vgutter.css('top', 0);
                    $element.addClass('bxResizeBorderTop');
                }else if($attrs.bxResizeBorder==='bottom'){
                    $vgutter.css('bottom', 0);
                    $element.addClass('bxResizeBorderBottom');
                } 
                $element[0].insertBefore(vgutterCopy,$element[0].firstChild);

                $vgutter.on('mousedown', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });
                }

        function mousemove(event) {
            if($attrs.bxMove === 'true'){
            }

            var newWidth = 0;
            if (($attrs.bxResize === 'horizontal') || $attrs.bxResize === 'both') {
                // Handle horizontal resizer
                var x = event.pageX;
                var maxWidth = $attrs.bxResizemax?$attrs.bxResizemax:MAXRESIZE;               
                var minWidth = 100 - maxWidth;

                var delta = 0;
                if($attrs.bxResizeBorder==='left'){
                    delta = $element[0].getBoundingClientRect().left - x + 10;
                }else if($attrs.bxResizeBorder==='right'){
                    delta = $element[0].getBoundingClientRect().right - x +10;
                }
                newWidth = 100*(delta + $element.width())/$parent.width() ;
                newWidth = (newWidth<=maxWidth)?newWidth:maxWidth;
                newWidth = (newWidth>=minWidth)?newWidth:minWidth;
                $element.css({
                        width: newWidth + '%'
                });
                if($attrs.bxSplitWith && document.getElementById($attrs.bxSplitWith)){
                    splitElement=angular.element(document.getElementById($attrs.bxSplitWith));
                    splitElement.css({width: 100-newWidth+ '%'});
                }
            } 
           
        if(($attrs.bxResize === 'vertical') || ($attrs.bxResize === 'both')){
                // Handle vertical resizer
                var newHeight = $element[0].getBoundingClientRect().height;
                var maxHeight = $attrs.bxResizeMax?$attrs.bxResizeMax:MAXRESIZE;               
                var minHeight = 100 - maxHeight;
                var y = event.pageY;
                //TODO ALLOW RESIZING FROM BOTTOM
                var topHeight = window.innerHeight+y-$element[0].getBoundingClientRect().top;
                var bottomHeight = window.innerHeight+y-$element[0].getBoundingClientRect().bottom;
                if($attrs.bxResizeBorder==='top'){
                    newHeight = 100*(1 - (bottomHeight)/window.innerHeight) ;
                }else if($attrs.bxResizeBorder==='bottom'){
                    newHeight = 100*(1 - (topHeight)/window.innerHeight) ;
                }
                newHeight = (newHeight<=maxHeight)?newHeight:maxHeight;
                newHeight = (newHeight>=minHeight)?newHeight:minHeight;
                $element.css({
                    height: newHeight + '%'
                });
                if($attrs.bxSplitWith && document.getElementById($attrs.bxSplitWith)){
                        splitElement=angular.element(document.getElementById($attrs.bxSplitWith));
                        splitElement.css({height: 100 - newHeight  + '%'});
                }

            }
        }

        function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
			$scope.$broadcast('bxResize');
        }
    };
});

boxy.directive('bxDraggable', function($document) {
  return {
    restrict: 'A',
    scope: {
      dragOptions: '=bxDraggable'
    },
    link: function(scope, elem, attr) {
      var startX, startY, startBottom, startRight, x = 0, y = 0,
          start, stop;

      // Bind mousedown event
      elem.on('mousedown', function(e) {
        if((Math.abs(elem[0].getBoundingClientRect().top - e.pageY)>20 || Math.abs(elem[0].getBoundingClientRect().left - e.pageX)<100)){return;}
        e.preventDefault();
        e.stopPropagation();
        startX = e.pageX;
        startY = e.pageY;
        startBottom = elem[0].getBoundingClientRect().bottom;
        startRight = elem[0].getBoundingClientRect().right;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        if (start) {start(e);}
      });

      // Handle drag event
      function mousemove(e) {
        y = e.clientY - startY;
        x = e.clientX - startX;
        setPosition();
      }

      // Unbind drag events
      function mouseup(e) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        if (stop) {stop(e);}
      }

      // Move element, within container if provided
      function setPosition() {

        var bottom = window.innerHeight-startBottom-y;
        bottom = (bottom>0)? bottom : 0;
        bottom = ((bottom+elem[0].getBoundingClientRect().height)<window.innerHeight)?bottom:(window.innerHeight-elem[0].getBoundingClientRect().height-40);

        var right =  window.innerWidth-startRight-x;
        right = (right>0)? right : 0;
        right = ((right+elem[0].getBoundingClientRect().width)<window.innerWidth)?right:(window.innerWidth-elem[0].getBoundingClientRect().width);

        elem.css({
          bottom: bottom + 'px',
          right: right  + 'px'
        });
      }
    }
  }

});
})();
