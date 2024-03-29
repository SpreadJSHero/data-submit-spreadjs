import pako from "pako"

function ungzipString(str) {
    if(!str){
        return "";
    }
    try {
        var restored = pako.ungzip(str, { to: "string" }); //解压
        return restored;
    } catch (err) {
        console.log(err);
    }
    return "";
}

// 返回压缩后Blob
function gzipString(str) {
    if(!str){
        return "";
    }
    try {
        var restored = pako.gzip(str, { to: "string" }); //压缩
        // return restored;
        return new Blob([restored]);
    } catch (err) {
        console.log(err);
    }
    return "";
}

function Gzip(){

}

Gzip.ungzipString = ungzipString;
Gzip.gzipString = gzipString;

export default Gzip;