var wordlist;
var optWordlist = Array();//optimized wordlist
var globalDirtyBit = false; 

function prepareOptimizedWordlist(){
    wordlist.content.forEach(function(element){
        element.words.forEach(function(w) {
            optWordlist.push(w);
        });
    });
    optWordlist.sort(function(a, b){
        var la = a.split().length;
        var lb = b.split().length;
        if(la > lb) return 1;
        if(la < lb) return -1;
        return 0;
    });    
}

function loadEverything(){
    $.getJSON("wordlist/words.json", function(data){
        wordlist = data;
        prepareOptimizedWordlist();
        wordlist.content.forEach(function(element){
            $("#words").append("<div class=\"panel panel-default\" id=\"" + element.id  + "-panel\"></div>");
            $("#"+ element.id  + "-panel").append(
                "<div class=\"panel-heading\"><h7 class=\"panel-title\"><a data-toggle=\"collapse\" href=\"#" + element.id + "-collapse\">" + element.name + "</a></h7></div>"
            );
            $("#"+ element.id  + "-panel").append(
                "<div id=\"" + element.id + "-collapse\" class=\"panel-collapse collapse\">"
            );
            var i = 0;
            element.words.forEach(function(w) {
                if( i < element.words.length - 1){
                    $("#" + element.id + "-collapse").append(
                        w + ", "
                    );    
                }else{
                    $("#" + element.id + "-collapse").append(
                        w
                    );    
                }                
                i++;
            });
        });
    });
}

function highlight(){
    var arr = [];
    var text = $('#wa').val();
    text = text.toLowerCase();
    text = text.replace(/[^a-z\n\#]/gi, " ");
    text = text + "\n";
    var start = 0;
    var end = text.indexOf("\n");
    while(end != -1){
        var line = text.substring(start, end);
        var lineCopy = (' ' + line).slice(1);
        if(line[0] == "#"){
            arr.push(
                {
                    "highlight": [start, end],
                    "className": "comment"
                }
            );
        }else{
            optWordlist.forEach(function(ow) {
                var re = new RegExp("\\b" + ow + "\\b", "gi");
                //There is a type of programmer who
                //when faced with a problem go:
                //I know, I will use regular expressions!
                //And now they have _two_ problems. 
                //Yeah. 
                //I am one of those. 
                lineCopy = lineCopy.replace(re, "" + ow.replace(/[a-z]/g, "^") + "");
            });
            lineCopy = lineCopy.replace(/[a-z]/gi, "%");
            console.log(lineCopy);
            {
                var pA = [];
                var f = lineCopy.indexOf("%", 0);
                var s = -1;
                var e = -1;
                while(f != -1){
                    pA.push(f);
                    f = lineCopy.indexOf("%", f + 1);
                }
                pA.push(-1);
                console.log(pA);
                pA.forEach(function(a) {
                    if(a == -1){
                        if(s != -1){
                            arr.push(
                                {
                                    "highlight": [start + s, start + e + 1],
                                    "className": "wrongWord"
                                }
                            );

                        }
                    }
                    else if(s == -1){
                        s = a;
                        e = a;
                    }else{
                        if((a - e) == 1){ 
                            e = a;
                        }else{
                            arr.push(
                                {
                                    "highlight": [start + s, start + e + 1],
                                    "className": "wrongWord"
                                }
                            );
                            s = a;
                            e = a;
                        }
                    }
                });
            }
            
        }
        start = end + 1;
        end =  text.indexOf("\n", start);
    }
    $("#wa").highlightWithinTextarea({
        highlight: arr
    }); 
    globalDirtyBit = false;
    $("#wa").focus();
}
$(document).ready(function() {
    $("#wa").keypress(function() {
        globalDirtyBit = true;
    })
    var x = setInterval(function() {
        
        if(globalDirtyBit){ //The control I used gums up regular keypresses. Sorry. 
            highlight();
        }
    }, 500);
    loadEverything();
});